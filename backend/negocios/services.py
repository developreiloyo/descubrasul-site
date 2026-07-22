from decimal import Decimal

import requests
from django.conf import settings
from django.core.cache import cache

PLACES_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
PLACES_DETAIL_URL = "https://maps.googleapis.com/maps/api/place/details/json"
REVIEWS_CACHE_TTL = 60 * 60 * 6  # 6 horas


def buscar_places_por_nome(nome: str, cidade: str) -> list[dict]:
    """Retorna até 3 candidatos do Google Places para o comerciante confirmar."""
    api_key = getattr(settings, "GOOGLE_MAPS_API_KEY", "")
    if not api_key:
        return []
    try:
        resp = requests.get(
            PLACES_SEARCH_URL,
            params={"query": f"{nome} {cidade} Santa Catarina Brasil", "key": api_key, "language": "pt-BR"},
            timeout=8,
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception:
        return []

    return [
        {
            "place_id":   p["place_id"],
            "nome":       p.get("name", ""),
            "endereco":   p.get("formatted_address", ""),
            "rating":     p.get("rating"),
            "total":      p.get("user_ratings_total"),
        }
        for p in data.get("results", [])[:3]
    ]


def buscar_reviews_google(place_id: str) -> dict | None:
    """Busca rating + reviews via Places Details API. Cacheia 6h no Redis."""
    if not place_id:
        return None

    cache_key = f"google_reviews_{place_id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    api_key = getattr(settings, "GOOGLE_MAPS_API_KEY", "")
    if not api_key:
        return None

    try:
        resp = requests.get(
            PLACES_DETAIL_URL,
            params={
                "place_id": place_id,
                "fields":   "name,rating,user_ratings_total,reviews,url",
                "language": "pt-BR",
                "key":      api_key,
            },
            timeout=8,
        )
        resp.raise_for_status()
        data = resp.json().get("result", {})
    except Exception:
        return None

    if not data:
        return None

    result = {
        "rating": data.get("rating"),
        "total":  data.get("user_ratings_total"),
        "url":    data.get("url", ""),
        "reviews": [
            {
                "autor":  r.get("author_name"),
                "foto":   r.get("profile_photo_url"),
                "nota":   r.get("rating"),
                "texto":  r.get("text", ""),
                "tempo":  r.get("relative_time_description"),
            }
            for r in data.get("reviews", [])[:5]
        ],
    }
    cache.set(cache_key, result, REVIEWS_CACHE_TTL)
    return result


def geocodificar_endereco(endereco: str) -> tuple[Decimal, Decimal] | None:
    """Calls Google Maps Geocoding API. Returns (lat, lng) or None on failure/no key."""
    api_key = getattr(settings, "GOOGLE_MAPS_API_KEY", "")
    if not api_key:
        return None

    try:
        resp = requests.get(
            "https://maps.googleapis.com/maps/api/geocode/json",
            params={"address": endereco, "key": api_key},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception:
        return None

    if data.get("status") == "OK" and data.get("results"):
        loc = data["results"][0]["geometry"]["location"]
        return Decimal(str(loc["lat"])), Decimal(str(loc["lng"]))

    return None

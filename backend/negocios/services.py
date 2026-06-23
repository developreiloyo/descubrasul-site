from decimal import Decimal

import requests
from django.conf import settings


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

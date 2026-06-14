import { NextRequest, NextResponse } from "next/server";

const API = process.env.API_URL_INTERNAL || "http://backend:8000/api";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${API}/usuarios/password-reset/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(
      { detail: data.detail || "Link inválido ou expirado." },
      { status: res.status }
    );
  }

  return NextResponse.json({ ok: true });
}

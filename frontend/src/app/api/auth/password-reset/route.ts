import { NextRequest, NextResponse } from "next/server";

const API = process.env.API_URL_INTERNAL || "http://backend:8000/api";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${API}/usuarios/password-reset/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json(
      { detail: "Erro ao solicitar redefinição de senha." },
      { status: res.status }
    );
  }

  return NextResponse.json({ ok: true });
}

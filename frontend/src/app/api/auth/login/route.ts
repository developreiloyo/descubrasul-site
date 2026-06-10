import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.API_URL_INTERNAL || "http://backend:8000/api";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${API}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json(
      { detail: "E-mail ou senha incorretos." },
      { status: 401 }
    );
  }

  const { access, refresh } = await res.json();
  const cookieStore = await cookies();

  // httpOnly: o JavaScript do browser NUNCA ve estes tokens
  cookieStore.set("access_token", access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 30, // 30 min — igual ao ACCESS_TOKEN_LIFETIME
  });

  cookieStore.set("refresh_token", refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  return NextResponse.json({ ok: true });
}


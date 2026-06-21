import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.API_URL_INTERNAL || "http://backend:8000/api";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Invalida o refresh token no Django antes de apagar o cookie.
  // Sem isso, um token capturado permanece válido por 7 dias após o logout.
  if (refreshToken) {
    await fetch(`${API}/auth/token/blacklist/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    }).catch(() => {}); // silencia erro de rede — cookies são deletados de qualquer forma
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  return NextResponse.json({ ok: true });
}

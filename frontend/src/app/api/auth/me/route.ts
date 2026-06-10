import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.API_URL_INTERNAL || "http://backend:8000/api";

export async function GET() {
  const cookieStore = await cookies();
  const access = cookieStore.get("access_token")?.value;

  if (!access) {
    return NextResponse.json({ detail: "Nao autenticado." }, { status: 401 });
  }

  const res = await fetch(`${API}/usuarios/me/`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ detail: "Sessao expirada." }, { status: 401 });
  }

  return NextResponse.json(await res.json());
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.API_URL_INTERNAL || "http://backend:8000/api";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

async function renovarAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refresh_token")?.value;
  if (!refresh) return null;

  const res = await fetch(`${API}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = await res.json();

  // Atualizar cookies — com ROTATE_REFRESH_TOKENS o Django devolve
  // tambem um novo refresh token
  cookieStore.set("access_token", data.access, {
    ...COOKIE_OPTS,
    maxAge: 60 * 30,
  });
  if (data.refresh) {
    cookieStore.set("refresh_token", data.refresh, {
      ...COOKIE_OPTS,
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return data.access;
}

async function chamarBackend(
  request: NextRequest,
  url: string,
  access: string,
  body: ArrayBuffer | undefined
) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${access}`,
  };
  if (body !== undefined) {
    const contentType = request.headers.get("content-type");
    if (contentType) headers["Content-Type"] = contentType;
  }

  return fetch(url, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });
}

async function proxy(request: NextRequest, path: string[]) {
  const cookieStore = await cookies();
  let access = cookieStore.get("access_token")?.value;

  const url = `${API}/${path.join("/")}/${request.nextUrl.search}`;

  let body: ArrayBuffer | undefined = undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    body = await request.arrayBuffer();
  }

  // Sem access token? Tentar renovar direto com o refresh
  if (!access) {
    access = (await renovarAccessToken()) ?? undefined;
    if (!access) {
      return NextResponse.json({ detail: "Nao autenticado." }, { status: 401 });
    }
  }

  let res = await chamarBackend(request, url, access, body);

  // Access expirado? Renovar UMA vez e repetir a request original
  if (res.status === 401) {
    const novoAccess = await renovarAccessToken();
    if (!novoAccess) {
      return NextResponse.json(
        { detail: "Sessao expirada. Faca login novamente." },
        { status: 401 }
      );
    }
    res = await chamarBackend(request, url, novoAccess, body);
  }

  if (res.status === 204) return new NextResponse(null, { status: 204 });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.API_URL_INTERNAL || "http://backend:8000/api";

async function proxy(request: NextRequest, path: string[]) {
  const cookieStore = await cookies();
  const access = cookieStore.get("access_token")?.value;
  if (!access) {
    return NextResponse.json({ detail: "Nao autenticado." }, { status: 401 });
  }

  const url = `${API}/${path.join("/")}/${request.nextUrl.search}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${access}`,
  };

  let body: ArrayBuffer | undefined = undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    // Ler o body COMPLETO como buffer — streaming corrompe multipart
    body = await request.arrayBuffer();
    const contentType = request.headers.get("content-type");
    if (contentType) headers["Content-Type"] = contentType;
  }

  const res = await fetch(url, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

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
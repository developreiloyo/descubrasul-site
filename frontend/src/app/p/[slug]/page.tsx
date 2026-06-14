import { redirect } from "next/navigation";

const API = process.env.API_URL_INTERNAL || "http://backend:8000/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ShortLinkPage({ params }: Props) {
  const { slug } = await params;

  try {
    const url = `${API}/negocios/${slug}/`;
    const res = await fetch(url, { cache: "no-store" });

    if (res.ok) {
      const negocio = await res.json();
      const destino = `/negocios/${negocio.cidade}/${negocio.categoria.slug}/${negocio.slug}`;
      redirect(destino);
    }

    // Negocio no encontrado o inactivo
    redirect("/");
  } catch (err) {
    // redirect() lanza un error internamente en Next.js — hay que relanzarlo
    throw err;
  }
}
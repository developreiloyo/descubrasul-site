import { redirect } from "next/navigation";

type Props = { searchParams: Promise<Record<string, string>> };

export default async function MarketplaceRedirect({ searchParams }: Props) {
  const sp = await searchParams;
  const qs = new URLSearchParams(sp as Record<string, string>).toString();
  redirect(`/vitrina${qs ? `?${qs}` : ""}`);
}

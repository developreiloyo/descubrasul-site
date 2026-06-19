"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-ink/10 bg-white px-4 py-4 shadow-lg md:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink/70">
          Usamos cookies para melhorar sua experiência e analisar o tráfego com
          Google Analytics. Ao continuar, você concorda com nossa{" "}
          <Link href="/privacidade" className="font-semibold text-primary underline">
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-4">
          <Link href="/privacidade" className="text-sm text-ink/50 underline">
            Saiba mais
          </Link>
          <button
            onClick={accept}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}

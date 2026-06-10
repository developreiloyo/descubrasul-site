import Script from "next/script";

export function GoogleAnalytics() {
  const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

  // So ativa se a variavel existir — dev fica limpo
  if (!GA4_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA4_ID}', {
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
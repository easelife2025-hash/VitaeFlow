import React from 'react';
import Script from 'next/script';

/**
 * Non-blocking Google Analytics 4 (GA4) loader.
 * Activates only when NEXT_PUBLIC_GA_MEASUREMENT_ID is configured in the environment.
 * Does not expose any server-side secrets.
 */
export default function GoogleAnalytics() {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

  if (!gaMeasurementId || !/^G-[A-Z0-9]+$/i.test(gaMeasurementId)) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaMeasurementId}', {
            page_path: window.location.pathname,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}

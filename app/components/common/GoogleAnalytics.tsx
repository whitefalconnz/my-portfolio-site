import Script from "next/script";

// The measurement ID (G-XXXXXXXXXX) from Google Analytics. Set it as
// NEXT_PUBLIC_GA_ID in the hosting environment and redeploy. With no ID set, or
// when running locally, nothing is added to the page.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Google Analytics 4. Visits to /about and /contact are counted automatically
 * because GA watches the browser's history. Projects open in a modal with no URL
 * of their own, so those are reported through trackEvent in lib/analytics.
 *
 * The library itself waits until the page has finished loading so it can't slow
 * down the first view. Anything recorded before then waits in the dataLayer.
 */
export default function GoogleAnalytics() {
  if (!GA_ID || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script id="google-analytics-setup" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
window.gtag = function () { window.dataLayer.push(arguments); };
window.gtag("js", new Date());
window.gtag("config", ${JSON.stringify(GA_ID)});`}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
    </>
  );
}

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Primary Meta Tags */}
        <meta name="title" content="Promptinator - AI-Powered Workflow Builder" />
        <meta name="description" content="Create intelligent AI workflows with drag-and-drop nodes, conditional prompts, and seamless integrations. Build complex automation flows visually with Promptinator." />
        <meta name="keywords" content="AI workflow, prompt engineering, automation, no-code, visual programming, AI assistant, workflow builder, prompt chains, conversational AI" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="author" content="Promptinator" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />

        {/* Favicon and Icons - with cache busting */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=4" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=4" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=4" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=4" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png?v=4" />
        <link rel="icon" type="image/png" sizes="64x64" href="/favicon-64x64.png?v=4" />
        <link rel="icon" type="image/png" sizes="128x128" href="/favicon-128x128.png?v=4" />
        <link rel="icon" type="image/png" sizes="256x256" href="/favicon-256x256.png?v=4" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=4" />
        <link rel="manifest" href="/manifest.json" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://promptinator.vercel.app/" />
        <meta property="og:title" content="Promptinator - AI-Powered Workflow Builder" />
        <meta property="og:description" content="Create intelligent AI workflows with drag-and-drop nodes, conditional prompts, and seamless integrations. Build complex automation flows visually with Promptinator." />
        <meta property="og:image" content="/favicon-256x256.png" />
        <meta property="og:image:alt" content="Promptinator - AI Workflow Builder" />
        <meta property="og:site_name" content="Promptinator" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://promptinator.vercel.app/" />
        <meta property="twitter:title" content="Promptinator - AI-Powered Workflow Builder" />
        <meta property="twitter:description" content="Create intelligent AI workflows with drag-and-drop nodes, conditional prompts, and seamless integrations. Build complex automation flows visually with Promptinator." />
        <meta property="twitter:image" content="/favicon-256x256.png" />
        <meta property="twitter:image:alt" content="Promptinator - AI Workflow Builder" />

        {/* Additional SEO */}
        <meta name="theme-color" content="#6366f1" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="application-name" content="Promptinator" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Promptinator" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Structured Data */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Promptinator",
              "description": "Create intelligent AI workflows with drag-and-drop nodes, conditional prompts, and seamless integrations. Build complex automation flows visually with Promptinator.",
              "url": "https://promptinator.vercel.app/",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "ratingCount": "1"
              }
            })
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

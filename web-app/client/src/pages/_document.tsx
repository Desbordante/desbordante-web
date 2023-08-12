import { Html, Head, Main, NextScript } from 'next/document';
import GoogleAnalytics from '@components/GoogleAnalytics';
import { isGoogleAnalyticsEnabled } from '@utils/env';

const MyDocument = () => {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Open-source data profiling tool" />

        {isGoogleAnalyticsEnabled && <GoogleAnalytics />}

        {/*OpenGraph*/}
        <meta
          property="og:url"
          content="https://desbordante.unidata-platform.ru/"
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Desbordante" />
        <meta
          property="og:description"
          content="Open-source data profiling tool"
        />
        <meta property="og:image" content="/og-image.jpg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:domain"
          content="desbordante.unidata-platform.ru"
        />
        <meta
          property="twitter:url"
          content="https://desbordante.unidata-platform.ru"
        />
        <meta name="twitter:title" content="Desbordante" />
        <meta
          name="twitter:description"
          content="Open-source data profiling tool"
        />
        <meta name="twitter:image" content="/og-image.jpg" />

        {/*Fonts*/}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Palanquin:wght@400;500;700&family=Roboto&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/logo.svg" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default MyDocument;

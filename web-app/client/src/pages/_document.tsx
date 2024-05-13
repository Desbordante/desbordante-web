import GoogleAnalytics from '@components/GoogleAnalytics';
import { isGoogleAnalyticsEnabled } from '@utils/env';
import { Html, Head, Main, NextScript } from 'next/document';

const MyDocument = () => {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        {isGoogleAnalyticsEnabled && <GoogleAnalytics />}

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

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.6.0/style.css' />
        <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont@1.1.0/style.css' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

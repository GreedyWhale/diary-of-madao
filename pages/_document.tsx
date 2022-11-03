import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
        <link rel='icon' type='image/png' href='/favicon.ico' />
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

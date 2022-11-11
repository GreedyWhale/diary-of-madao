import type { AppProps } from 'next/app';
import Head from 'next/head';

import '~/assets/styles/global.scss';
import '~/assets/styles/reset.scss';
import '~/assets/styles/markdown.scss';
import { Layout } from '~/components/Layout';
import { Backdrop } from '~/components/Backdrop';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>牢骚百物语</title>
      </Head>
      <Backdrop />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;

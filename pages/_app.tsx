import type { AppProps } from 'next/app';
import Head from 'next/head';

import '~/assets/styles/global.scss';
import '~/assets/styles/reset.scss';
import { Layout } from '~/components/Layout';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>牢骚百物语</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;

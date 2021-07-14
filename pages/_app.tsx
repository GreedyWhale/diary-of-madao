/*
 * @Author: MADAO
 * @Date: 2021-06-10 15:46:14
 * @LastEditors: MADAO
 * @LastEditTime: 2021-07-14 22:53:57
 * @Description: 入口文件
 */
import React from 'react';
import Head from 'next/head';
import '~/styles/globals.scss';

import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>牢骚百物语</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/images/logo/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/logo/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/logo/favicon-16x16.png" />
        <link rel="icon" href="/images/logo/favicon.ico" />
        <link rel="manifest" href="/images/logo/site.webmanifest" />
        <link rel="mask-icon" href="/images/logo/safari-pinned-tab.svg" color="#f05454" />
        <meta name="msapplication-TileColor" content="#f05454" />
        <meta name="theme-color" content="#f05454" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;

/*
 * @Author: MADAO
 * @Date: 2021-06-10 15:46:14
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-19 10:05:29
 * @Description: 入口文件
 */
import type { AppProps } from 'next/app';

import React from 'react';
import Head from 'next/head';
import { Provider } from 'react-redux';

import 'normalize.css';
import '~/assets/styles/globals.scss';
import '~/assets/styles/markdown.scss';
import Backdrop from '~/components/Backdrop';

import createStore from '~/store';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={createStore()}>
      <Head>
        <title>牢骚百物语</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/images/logo/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/logo/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/logo/favicon-16x16.png" />
        <link rel="icon" type="image/png" href="/images/logo/favicon.ico" />
        <link rel="manifest" href="/images/logo/site.webmanifest" />
        <link rel="mask-icon" href="/images/logo/safari-pinned-tab.svg" color="#ffffff" />
        <meta name="description" content="Programming, notes" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Backdrop />
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;

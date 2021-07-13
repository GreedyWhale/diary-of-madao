/*
 * @Author: MADAO
 * @Date: 2021-06-10 15:46:14
 * @LastEditors: MADAO
 * @LastEditTime: 2021-07-13 23:46:08
 * @Description: 入口文件
 */
import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '~/styles/globals.scss';

import styles from '~/styles/layout.module.scss';

function MyApp({ Component, pageProps }: AppProps) {
  const [welcomeText, setWelcomeText] = React.useState({
    currentIndex: 0,
    currentRow: 0,
    rawText: ['欢迎来到牢骚百物语!', '这里记录了我的一些技术博客', '希望可以帮到你^_^'],
    displayText: []
  });

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      let { currentIndex, currentRow, rawText, displayText } = welcomeText;
      if (currentRow === rawText.length - 1 && currentIndex === rawText[currentRow].length) {
        return;
      }

      if (currentIndex === rawText[currentRow].length) {
        currentIndex = 0;
        currentRow += 1;
      }

      const character = rawText[currentRow].charAt(currentIndex);
      displayText[currentRow] = displayText[currentRow] ? displayText[currentRow] + character : character;
      setWelcomeText({
        currentIndex: currentIndex + 1,
        currentRow,
        rawText,
        displayText
      });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [welcomeText]);

  return (
    <>
      <Head>
        <title>MADAO观察日记</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#f05454" />
        <meta name="msapplication-TileColor" content="#f05454" />
        <meta name="theme-color" content="#f05454" />
      </Head>
      <main className={styles.layout}>
        <div className={styles.welcome}>
          {welcomeText.displayText.map(value => (<p key={value}>{value}</p>))}
        </div>
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default MyApp;

/*
 * @Author: MADAO
 * @Date: 2021-06-10 15:46:14
 * @LastEditors: MADAO
 * @LastEditTime: 2021-07-15 00:24:14
 * @Description: 主页
 */
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import styles from '~/styles/index.module.scss';
import Terminal from '~/components/Terminal';

export default function Home() {
  const [welcomeText, setWelcomeText] = React.useState({
    currentIndex: 0,
    currentRow: 0,
    rawText: ['欢迎来到牢骚百物语!', '这里记录了我的所有技术博客', '希望可以帮到你^_^'],
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
    <main className={styles.layout}>
      <header className={styles.header}>
        <nav>
          <Link href="/">
            <a>
              <Image src="/images/candle.png" alt="logo" width={32} height={32} />
            </a>
          </Link>
          <Link href="/login">
            登录
          </Link>
        </nav>
      </header>
      <div className={styles.welcome}>
        {welcomeText.displayText.map(value => (<p key={value}>{value}</p>))}
      </div>
      <Terminal />
    </main>
  );
}

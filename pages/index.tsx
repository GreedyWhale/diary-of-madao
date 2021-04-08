import React from 'react';
import type { NextPage } from 'next';
import styles from '~/styles/index.module.scss';
import BaseNav from '~/components/BaseNav';

const Home: NextPage = () => (
  <div className={styles.container}>
    <div className={styles.body}>
      <BaseNav />
      <div className={styles.content}>
        <h1>Latest posts &#9997;</h1>
        <ul className={styles.list}>
          <li>
            <span>Aug27, 2018</span>
            <h2>这是我的第一篇博客啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦</h2>
          </li>
          <li>
            <span>Aug27, 2018</span>
            <h2>这是我的第一篇博客啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦</h2>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

export default Home;

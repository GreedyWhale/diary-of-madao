import React from 'react';
import Link from 'next/link';

import styles from './index.module.scss';

export const Card: React.FC = () => (
  <div className={styles.container}>
    <h3>莉可赛高</h3>
    <p className={styles.meta}>2022-03-29 [UpdateAt: 2022-07-22] · <span>MADAO</span></p>
    <p className={styles.summary}>
        不管给他多少酒，都会从他的眼睛里流出来。当我问他“为什么好心给你的酒都流出来了呢？”
        不管给他多少酒，都会从他的眼睛里流出来。当我问他“为什么好心给你的酒都流出来了呢？”
    </p>
    <Link href='/'>查看详情 👈</Link>
  </div>
);

import React from 'react';
import Image from 'next/image';

import styles from '~/assets/styles/footer.module.scss';

const Footer: React.FC = () => (
  <div className={styles.footer}>
    <a
      href="https://beian.miit.gov.cn"
      target="_blank"
      rel="noreferrer"
    >
        陇ICP备2021003360号-1
    </a>
    <div>
      <a className={styles.record} target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=62042302000165" rel="noreferrer">
        <Image src="/images/record_icon.png" width={20} height={20} alt="record icon" />
        <p>甘公网安备 62042302000165号</p>
      </a>
    </div>
  </div>
);

export default Footer;

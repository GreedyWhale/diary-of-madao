import React from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';

import styles from '~/styles/terminal.module.scss';

const Terminal: React.FC = () => {
  const router = useRouter();

  const command = React.useMemo(() => {
    switch (router.pathname) {
      case '/':
        return 'ls -a';
      default:
        return 'hello world!';
    }
  }, [router.pathname]);

  return (
    <div className={styles.container}>
      <div className={styles.pathInfo}>
        <span>#</span>
        <p>MADAO</p>
        <span>@</span>
        <p>IBN5100</p>
        <span>in</span>
        <p>~{router.pathname}</p>
        <span>[{moment().format('YYYY-MM-DD')}]</span>
      </div>
      <div className={styles.command}>
        <span>$</span>
        <p>{command}</p>
        <div className={styles.inputSymbol}>|</div>
      </div>
    </div>
  );
};

export default Terminal;

import type { TerminalProps } from './type';

import React from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';

import styles from './index.module.scss';

const Terminal = (props: TerminalProps) => {
  const router = useRouter();

  const _command = React.useMemo(() => props.command || 'hello world!', [props.command]);

  return (
    <div className={styles.container}>
      <div className={styles.pathInfo}>
        <span>#</span>
        <p>MADAO</p>
        <span>@</span>
        <p>IBN5100</p>
        <span>in</span>
        <p>~{router.asPath}</p>
        <span>[{moment().format('YYYY-MM-DD')}]</span>
      </div>
      <div className={styles.command}>
        <span>$</span>
        <p>{_command}</p>
        <div className={styles.inputSymbol}>|</div>
      </div>
    </div>
  );
};

export default Terminal;

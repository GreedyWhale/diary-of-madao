import React from 'react';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';

import styles from './index.module.scss';

type TerminalProps = {
  command?: string;
};

export const Terminal = (props: TerminalProps) => {
  const router = useRouter();

  const _command = React.useMemo(() => props.command ?? 'hello world!', [props.command]);

  return (
    <div className={styles.container}>
      <div className={styles.pathInfo}>
        <span>#</span>
        <p>MADAO</p>
        <span>@</span>
        <p>IBN5100</p>
        <span>in</span>
        <p>~{router.asPath}</p>
        <span>[{dayjs().format('YYYY-MM-DD')}]</span>
      </div>
      <div className={styles.command}>
        <span>$</span>
        <p>{_command}</p>
        <div className={styles.inputSymbol}>|</div>
      </div>
    </div>
  );
};

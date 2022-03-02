import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import styles from './index.module.scss';

import useUser, { useSignOut } from '~/utils/hooks/useUser';

const Header = () => {
  const router = useRouter();
  const { user } = useUser();
  const { SignOutDialog } = useSignOut();

  const [open, setOpen] = React.useState(false);
  const username = React.useMemo(() => user.username || '登录', [user.username]);

  const toSignIn = (event: React.MouseEvent) => {
    event.preventDefault();
    if (user.id !== -1) {
      setOpen(true);
      return;
    }

    router.push('/signIn');
  };

  return (
    <>
      <header className={styles.header}>
        <nav>
          <Link href="/" passHref>
            <h1 className={styles.title}>MADAO觀察日記</h1>
          </Link>
          <div className={styles.menu}>
            <Link href="/classify">
              文章分类
            </Link>
            <Link href="/signIn" passHref>
              <a onClick={toSignIn} className={styles.username} title={username}>
                {username}
              </a>
            </Link>
          </div>
        </nav>
      </header>
      <SignOutDialog
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      />
    </>
  );
};

export default Header;


import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import styles from '~/assets/styles/header.module.scss';

import useUser from '~/utils/hooks/useUser';
import SignOutModal from '~/components/SignOutModal';

const Header = () => {
  const router = useRouter();
  const { user } = useUser();
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
          <Link href="/">
            <a className={styles.logoIcon}>
              <Image src="/images/candle.png" alt="logo" width={32} height={32} />
            </a>
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
      <SignOutModal
        open={open}
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
};

export default Header;


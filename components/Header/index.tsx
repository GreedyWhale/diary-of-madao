import type { UserMenuProps, UserMenuTypes } from '~/types/components/header';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import styles from './index.module.scss';

import useUser, { useSignOut } from '~/utils/hooks/useUser';

const UserMenu: React.FC<UserMenuProps> = props => {
  const router = useRouter();
  const { SignOutDialog } = useSignOut();
  const [open, setOpen] = React.useState(false);

  const menu = React.useRef<{ text: string, type: UserMenuTypes }[]>([
    { text: '创建文章', type: 'createPost' },
    { text: '退出登录', type: 'signOut' },
  ]);

  const handleClick = (event: React.MouseEvent, type: UserMenuTypes) => {
    event.stopPropagation();
    event.preventDefault();

    const handlerMap = {
      createPost: () => router.push('/posts/editor'),
      signOut: () => setOpen(true),
    };

    handlerMap[type]();
  };

  React.useEffect(() => {
    const listener = () => {
      props.onHide(false);
    };

    document.body.addEventListener('click', listener);

    return () => {
      document.body.removeEventListener('click', listener);
    };
  }, [props]);

  return (
    <>
      {props.visible && (
        <ul className={styles.userMenu}>
          {menu.current.map(value => (
            <li key={value.type} onClick={event => handleClick(event, value.type)}>{value.text}</li>
          ))}
        </ul>
      )}
      <SignOutDialog
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      />
    </>
  );
};

const Header = () => {
  const router = useRouter();
  const { user } = useUser();
  const [visibleMenu, setVisibleMenu] = React.useState(false);
  const username = React.useMemo(() => user.username || '登录', [user.username]);

  const toSignIn = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (user.id !== -1) {
      setVisibleMenu(prev => !prev);
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
                <UserMenu visible={visibleMenu} onHide={visible => setVisibleMenu(visible) } />
              </a>
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;


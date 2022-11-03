import type { NextPage } from 'next';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import styles from './index.module.scss';

import { useUser } from '~/hooks/useUser';

const navMap = [
  { text: '首页⛺️', href: '/' },
  { text: '技术笔记📔', href: '/skills' },
  { text: '读书笔记📚', href: '/study' },
  { text: '标签🏷️', href: '/tag' },
  { text: '关于我🧐', href: '/about' },
];

const loginPageHref = '/login';

const UserProfile: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useUser();

  return (
    <li data-active={router.asPath === loginPageHref}>
      {user?.id
        ? (
          <div className={styles.submenu}>
            {user.username}
            <ul>
              <li><Link href='/notes/create'>创建笔记</Link></li>
              <li onClick={logout}>退出登录</li>
            </ul>
          </div>
        )
        : <Link href={loginPageHref}>登录👈</Link>
      }
    </li>
  );
};

export const Navbar: NextPage = () => {
  const router = useRouter();

  return (
    <ul className={styles.container}>
      {navMap.map(nav => (
        <li key={nav.text} data-active={nav.href === router.asPath}>
          <Link href={nav.href}>{nav.text}</Link>
        </li>
      ))}

      <UserProfile />
    </ul>
  );
};

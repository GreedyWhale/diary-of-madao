import type { NextPage } from 'next';

import Link from 'next/link';
import { useRouter } from 'next/router';

import styles from './index.module.scss';

const navMap = [
  { text: '首页⛺️', href: '/' },
  { text: '技术笔记📔', href: '/skills' },
  { text: '读书笔记📚', href: '/study' },
  { text: '标签🏷️', href: '/tag' },
  { text: '关于我🧐', href: '/about' },
  { text: '登录👈', href: '/signIn' },
];

export const Navbar: NextPage = () => {
  const router = useRouter();
  return (
    <ul className={styles.container}>
      {navMap.map(nav => (
        <li key={nav.text} data-active={nav.href === router.asPath}>
          <Link href={nav.href}>{nav.text}</Link>
        </li>
      ))}
    </ul>
  );
};

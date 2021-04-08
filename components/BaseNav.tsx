import React, { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './BaseNav.module.scss';

const BaseNav: React.FC = () => {
  const navList = useRef([
    { text: 'blog', path: '/' },
    { text: 'search', path: '/search' },
    { text: 'user', path: '/user' },
    { text: 'about', path: '/about' },
  ]);
  const router = useRouter();

  return (
    <div className={styles.container}>
      <h3>Name</h3>
      <ul>
        {navList.current.map((nav) => (
          <li key={nav.text} className={router.pathname === nav.path ? styles.active : ''}>
            <Link href={nav.path}>{nav.text}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BaseNav;

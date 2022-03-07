import type { LayoutProps } from '~/types/components/layout';

import React from 'react';
import Error from 'next/error';

import styles from './index.module.scss';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import Sidebar from '~/components/GoTop';

const Layout: React.FC<LayoutProps> = props => {
  if (props.errorInfo) {
    return <Error
      statusCode={props.errorInfo.errorCode}
      title={props.errorInfo.errorMessage}
    />;
  }

  return (
    <main className={styles.layout}>
      <Header />
      <Sidebar />
      {props.children}
      <Footer />
    </main>
  );
};

export default Layout;

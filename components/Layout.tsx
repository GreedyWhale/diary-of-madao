import React from 'react';
import PropTypes from 'prop-types';

import styles from '~/assets/styles/layout.module.scss';
import Header from '~/components/Header';
import Footer from '~/components/Footer';

const Layout = ({ children }) => {
  return (
    <main className={styles.layout}>
      <Header />
      { children }
      <Footer />
    </main>
  );
};

Layout.propTypes = {
  children: PropTypes.node
};

export default Layout;

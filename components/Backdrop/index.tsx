import React from 'react';
import { useRouter } from 'next/router';

import styles from './index.module.scss';
import Loading from '~/components/Loading';

export const Backdrop = () => {
  const router = useRouter();
  const [showLoading, setShowLoading] = React.useState(false);
  React.useEffect(() => {
    const handleRouteStart = () => setShowLoading(true);
    const handleRouteComplete = () => setShowLoading(false);
    router.events.on('routeChangeStart', handleRouteStart);
    router.events.on('routeChangeComplete', handleRouteComplete);
    router.events.on('routeChangeError', handleRouteComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteStart);
      router.events.off('routeChangeComplete', handleRouteComplete);
      router.events.off('routeChangeError', handleRouteComplete);
    };
  }, [router.events]);

  return (
    <>
      {showLoading && (
        <div className={styles.backdrop}>
          <Loading width={65} height={65} />
        </div>
      )}
    </>
  );
};

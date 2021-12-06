import React from 'react';
import { useRouter } from 'next/router';

const Loading = () => {
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

  React.useEffect(() => {
    document.body.setAttribute('data-prevent-scroll', `${showLoading}`);
  }, [showLoading]);

  return (
    <>
      {showLoading && (
        <div className="ui active dimmer">
          <div className="ui text loader">Loading</div>
        </div>
      )}
    </>
  );
};

export default Loading;

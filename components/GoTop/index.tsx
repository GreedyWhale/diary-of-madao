import React from 'react';
import { CSSTransition } from 'react-transition-group';

import styles from './index.module.scss';

const GoTop: React.FC = () => {
  /**
   * @see https://github.com/reactjs/react-transition-group/issues/779
   */
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  React.useEffect(() => {
    let scrollTimer = -1;
    const listener = () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.requestAnimationFrame(() => {
        const { scrollTop } = document.documentElement;
        if (scrollTop > 300 && !visible) {
          setVisible(true);
        } else if (visible && scrollTop < 300) {
          setVisible(false);
        }
      });
    };

    document.addEventListener('scroll', listener);
    return () => {
      document.removeEventListener('scroll', listener);
    };
  }, [visible]);

  return (
    <CSSTransition
      nodeRef={ref}
      in={visible}
      timeout={300}
      classNames={{
        enter: styles.goTopAnimationEnter,
        enterActive: styles.goTopAnimationEnterActive,
        exit: styles.goTopAnimationExit,
        exitActive: styles.goTopAnimationExitActive,
      }}
      unmountOnExit
    >
      <div className={styles.goTop} ref={ref} onClick={scrollTop}>
        <div data-icon="go_top" />
      </div>
    </CSSTransition>
  );
};

export default GoTop;

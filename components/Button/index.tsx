import type { ButtonProps } from '~/types/components/button';

import React from 'react';

import useMounted from '~/utils/hooks/useMounted';

import styles from './index.module.scss';
import Loading from '~/components/Loading';

const Button: React.FC<ButtonProps> = props => {
  const mounted = useMounted();
  const { children, onClick, loading } = props;
  const [innerLoading, setInnerLoading] = React.useState(loading);
  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (props.disable || innerLoading) {
      return;
    }

    setInnerLoading(true);
    if (onClick) {
      await onClick(event).catch(error => console.error(error));
    }

    if (mounted.current) {
      setInnerLoading(false);
    }
  };

  return (
    <button
      className={styles.btn}
      aria-disabled={props.disable}
      data-color={props.color}
      data-loading={innerLoading}
      data-variant={props.variant}
      onClick={handleClick}
    >
      {props.loading && <Loading width={'1em'} height={'1em'} />}
      <span className={styles.content}>
        {children}
      </span>
    </button>
  );
};

Button.defaultProps = {
  variant: 'contained',
  color: 'primary',
};

export default Button;

import React from 'react';

import styles from './index.module.scss';
import Loading from '~/components/Loading';

export type ButtonProps = {
  theme?: 'default' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
  onClick?: (el: React.MouseEvent<HTMLButtonElement>) => Promise<any>;
  loading?: boolean;
};

export const Button: React.FC<React.PropsWithChildren<ButtonProps>> = props => {
  const [loading, setLoading] = React.useState(Boolean(props.loading));

  const handleClick = async (el: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      return;
    }

    setLoading(true);
    if (props.onClick) {
      props.onClick(el).finally(() => { setLoading(Boolean(props.loading)); });
    }
  };

  return (
    <button
      className={styles.container}
      type={props.type}
      data-theme={props.theme ?? 'default'}
      data-loading={loading}
      onClick={handleClick}
    >
      {loading && <div className={styles.loading_wrap}><Loading width='1em' height='1em' /></div>}
      {props.children}
    </button>
  );
};

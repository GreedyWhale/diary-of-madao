import React from 'react';

import styles from './index.module.scss';
import Loading from '~/components/Loading';

type ButtonProps = {
  theme: 'default' | 'danger' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
  onClick: (el: React.MouseEvent<HTMLButtonElement>) => Promise<any>;
  loading?: boolean;
};

export const Button: React.FC<React.PropsWithChildren<ButtonProps>> = props => {
  const [loading, setLoading] = React.useState(Boolean(props.loading));

  const handleClick = async (el: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      return;
    }

    setLoading(true);
    props.onClick(el).finally(() => { setLoading(Boolean(props.loading)); });
  };

  return (
    <button
      className={styles.container}
      type={props.type}
      data-theme={props.theme}
      data-loading={loading}
      onClick={handleClick}
    >
      {loading ? <Loading width='1em' height='1em' /> : props.children}
    </button>
  );
};

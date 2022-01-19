import type { LoadingProps } from '~/types/components/Loading';

import React from 'react';

import styles from './index.module.scss';

const Loading: React.FC<LoadingProps> = props => (
  <span
    className={styles.loading}
    style={{
      width: props.width,
      height: props.height,
    }}
  />
);

Loading.defaultProps = {
  height: '48px',
  width: '48px',
};

export default Loading;

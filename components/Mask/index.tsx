import React from 'react';

import styles from './index.module.scss';

type MaskProps = {
  onClick?: () => void;
};

export const Mask: React.FC<MaskProps> = props => (
  <div className={styles.container} onClick={props.onClick} />
);

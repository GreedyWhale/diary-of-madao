import type { SpaceBetweenProps } from '~/types/components/spaceBetween';

import React from 'react';

import styles from './index.module.scss';

const SpaceBetween = (props: SpaceBetweenProps) => (
  <div className={styles.container}>
    {props.children}
  </div>
);

SpaceBetween.Left = (props: SpaceBetweenProps) => <div className={styles.left}>{props.children}</div>;
SpaceBetween.Right = (props: SpaceBetweenProps) => <div className={styles.right}>{props.children}</div>;

export default SpaceBetween;

import type { DialogProps } from '~/types/components/dialog';

import React from 'react';

import styles from './index.module.scss';

const Dialog: React.FC<DialogProps> = props => {
  if (!props.open) {
    return <></>;
  }

  return (
    <div className={styles.dialog}>
      <div className={styles.mask} onClick={props.onClose}/>
      <div className={styles.container}>
        <header>{props.title}</header>
        <div className={styles.body}>
          {props.content}
        </div>
        <div className={styles.actions}>
          {props.actions}
        </div>
      </div>
    </div>
  );
};

export default Dialog;

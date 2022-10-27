import type { NoteWithoutContent } from '~/model/note';

import React from 'react';
import Link from 'next/link';

import styles from './index.module.scss';

import { formatDate } from '~/lib/date';

export const Card: React.FC<NoteWithoutContent> = props => (
  <div className={styles.container}>
    <h3>{props.title}</h3>
    <p className={styles.meta}>{formatDate(props.createdAt)} [UpdateAt: {formatDate(props.updatedAt)}] · <span>{props.author.username}</span></p>
    <ul className={styles.labels}>
      {props.labels.map(label => (
        <li key={label.name}>#{label.name}</li>
      ))}
    </ul>
    <p className={styles.summary}>
      {props.introduction}
    </p>
    <Link href='/'>查看详情 👈</Link>
  </div>
);

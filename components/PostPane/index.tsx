import type { PostPaneProps } from './type';

import React from 'react';
import Link from 'next/link';
import moment from 'moment';

import styles from './index.module.scss';
import PostTitle from '~/components/PostTitle';

const PostPane = (props: PostPaneProps) => (
  <article className={styles.container}>
    <PostTitle
      title={props.post.title}
      metaInfo={`${moment(props.post.createdAt).format('YYYY-MM-DD')} [Updated: ${moment(props.post.updatedAt).format('YYYY-MM-DD')}] :: ${props.post.author.username}`}
    />
    <ul className={styles.labels}>
      {props.post.labels.map(item => (
        <li key={item.label.id}>#{item.label.name}</li>
      ))}
    </ul>
    <p className={styles.introduction}>
      {props.post.introduction}
    </p>
    <Link href={`/posts/${props.post.id}`}>
      <a>阅读更多 →</a>
    </Link>
  </article>
);

export default PostPane;

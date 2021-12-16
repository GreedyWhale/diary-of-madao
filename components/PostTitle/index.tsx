import type { PostTitleProps } from './type';

import React from 'react';
import PropTypes from 'prop-types';

import styles from './index.module.scss';

const PostTitle = ({ title, metaInfo }: PostTitleProps) => (
  <div className={styles.container}>
    <h2>{title}</h2>
    <div className={styles.meta}>{metaInfo}</div>
  </div>
);

PostTitle.propTypes = {
  title: PropTypes.string,
  metaInfo: PropTypes.string,
};

export default PostTitle;

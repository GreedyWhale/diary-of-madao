import React from 'react';
import PropTypes from 'prop-types';

import styles from '~/assets/styles/postTitle.module.scss';

interface PostTitleProps {
  title: string;
  metaInfo: string;
}

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

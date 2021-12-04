/*
 * @Author: MADAO
 * @Date: 2021-06-10 15:46:14
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-04 12:26:21
 * @Description: 主页
 */
import type { NextPage } from 'next';
import type { GetPostsResponse } from '~/services/post';
import type { WithSessionResult } from '~/utils/withSession';

import React from 'react';

import Layout from '~/components/Layout';
import PostPane from '~/components/PostPane';
import Terminal from '~/components/Terminal';
import Welcome from '~/components/Welcome';
import Pagination from '~/components/Pagination';
import styles from '~/assets/styles/index.module.scss';

import { withSession } from '~/utils/withSession';
import { useUpdateUserId } from '~/utils/hooks/useUser';
import { getPosts } from '~/services/post';

const Home: NextPage<WithSessionResult<{
  posts: GetPostsResponse['list'];
  pagination: GetPostsResponse['pagination'];
}>> = props => {
  useUpdateUserId(props.userId);

  const [currentPage, setCurrentPage] = React.useState(props.pagination.currentPage);

  return (
    <Layout>
      <Welcome />
      <Terminal command="ls -a" />
      <div className={styles.posts}>
        {(props.posts && props.posts.length) && (
          props.posts.map(post => <PostPane post={post} key={post.id} />)
        )}
      </div>
      <Pagination
        pageSize={props.pagination.pageSize}
        total={props.pagination.total}
        currentPage={currentPage}
        onClick={params => setCurrentPage(params)}
      />
    </Layout>
  );
};

export default Home;

export const getServerSideProps = withSession(async context => {
  const { page } = context.query;
  const postInfo = await getPosts({
    page: page ? parseInt(page as string, 10) : 1,
    pageSize: 10,
  });

  return {
    props: {
      posts: postInfo.data.list,
      pagination: postInfo.data.pagination,
    },
  };
});

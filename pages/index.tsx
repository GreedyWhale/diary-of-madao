/*
 * @Author: MADAO
 * @Date: 2021-06-10 15:46:14
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-05 22:22:16
 * @Description: 主页
 */
import type { NextPage, InferGetServerSidePropsType, NextApiRequest } from 'next';

import React from 'react';

import Layout from '~/components/Layout';
import PostPane from '~/components/PostPane';
import Terminal from '~/components/Terminal';
import Welcome from '~/components/Welcome';
import Pagination from '~/components/Pagination';
import styles from '~/assets/styles/index.module.scss';

import { withSessionSsr, getUserIdFromCookie } from '~/utils/withSession';
import { useUpdateUserId } from '~/utils/hooks/useUser';
import { getPosts } from '~/services/post';
import { promiseWithError } from '~/utils/promise';
import { getErrorInfo } from '~/utils/request/tools';

const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
  useUpdateUserId(props.userId);

  const [currentPage, setCurrentPage] = React.useState(props.pagination.currentPage);

  return (
    <Layout errorInfo={props.errorInfo}>
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

export const getServerSideProps = withSessionSsr(async context => {
  const { page } = context.query;
  const [postInfo, error] = await promiseWithError(getPosts({
    page: page ? parseInt(page as string, 10) : 1,
    pageSize: 10,
  }));

  return {
    props: {
      pagination: postInfo ? postInfo.data.data.pagination : {
        pageSize: 10,
        currentPage: 1,
        total: 1,
      },
      posts: postInfo ? postInfo.data.data.list : [],
      userId: getUserIdFromCookie(context.req as NextApiRequest),
      errorInfo: getErrorInfo(error),
    },
  };
});

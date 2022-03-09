import type { NextPage, InferGetServerSidePropsType, NextApiRequest } from 'next';
import type { PostItem, GetPostsParams } from '~/types/services/post';
import type { API } from '~/types/API';
import type { LabelList } from '~/types/services/label';

import React from 'react';

import { getLabels } from '~/services/label';
import { getPosts } from '~/services/post';
import { withSessionSsr, getUserIdFromCookie } from '~/utils/withSession';
import { promiseWithError } from '~/utils/promise';
import { getErrorInfo } from '~/utils/middlewares';

import Layout from '~/components/Layout';
import Terminal from '~/components/Terminal';
import PostPane from '~/components/PostPane';
import Pagination from '~/components/Pagination';
import styles from '~/assets/styles/postsCategory.module.scss';

const PostsCategory: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
  const [command, setCommand] = React.useState('ls -ltr *');
  const [pagination, setPagination] = React.useState<API.BasePagination>({
    pageSize: 10,
    currentPage: 1,
    total: 1,
  });
  const [posts, setPosts] = React.useState<PostItem[]>([]);
  const [selectedLabel, setSelectedLabel] = React.useState<LabelList[number]>({
    id: 0,
    name: '',
    posts: [],
  });

  const getCategorizedPosts = (params: GetPostsParams) => {
    getPosts(params)
      .then(res => {
        setPosts(res.data.data.list);
        setPagination({ ...res.data.data.pagination });
      });
  };

  return (
    <Layout>
      <Terminal command={command} />
      <div>
        <ul className={styles.labels} data-collapse={Boolean(posts.length)}>
          {props.labels.map(value => (
            <li
              data-selected={value.id === selectedLabel.id}
              key={value.id}
              onClick={() => {
                setCommand(`ls -ltr ${value.name}`);
                setSelectedLabel(value);
                getCategorizedPosts({
                  page: pagination.currentPage,
                  pageSize: pagination.pageSize,
                  labelId: value.id,
                });
              }}
            >
              {value.name}({value.posts.length})
            </li>
          ))}
          <li
            className={styles.labelListControl}
            onClick={() => {
              setPosts([]);
            }}
          >
            展开
          </li>
        </ul>
        {Boolean(posts.length) && (
          <>
            <ul className={styles.posts}>
              {posts.map(value => <PostPane post={value} key={value.id} />)}
            </ul>
            <Pagination
              {...pagination}
              onClick={page => {
                getCategorizedPosts({
                  page,
                  pageSize: pagination.pageSize,
                  labelId: selectedLabel.id,
                });
                setPagination(prev => ({ ...prev, currentPage: page }));
              }}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default PostsCategory;

export const getServerSideProps = withSessionSsr(async context => {
  const [labels, error] = await promiseWithError(getLabels());

  return {
    props: {
      userId: getUserIdFromCookie(context.req as NextApiRequest),
      labels: labels ? labels.data.data : [],
      errorInfo: getErrorInfo(error),
    },
  };
});

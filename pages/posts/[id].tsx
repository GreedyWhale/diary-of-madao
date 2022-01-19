import type { NextPage, InferGetServerSidePropsType, NextApiRequest } from 'next';

import React from 'react';
import moment from 'moment';
import matter from 'gray-matter';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Viewer } from '@bytemd/react';

import { getPostDetail, deletePost } from '~/services/post';
import { withSessionSsr, getUserIdFromCookie } from '~/utils/withSession';
import { useUpdateUserId } from '~/utils/hooks/useUser';
import { ACCESS_POST_DELETE } from '~/utils/constants';
import useUser from '~/utils/hooks/useUser';
import { useMarkdownPlugins } from '~/utils/hooks/useMarkdown';
import { promiseWithError } from '~/utils/promise';
import { getErrorInfo } from '~/utils/request/tools';

import styles from '~/assets/styles/posts.module.scss';
import Layout from '~/components/Layout';
import PostTitle from '~/components/PostTitle';
import Terminal from '~/components/Terminal';
import Button from '~/components/Button';
import Dialog from '~/components/Dialog';
import showNotification from '~/components/Notification';

const Posts: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
  const router = useRouter();
  const { user } = useUser();
  const plugins = useMarkdownPlugins();

  useUpdateUserId(props.userId);
  const [visibleDeleteModal, setVisibleDeleteModal] = React.useState(false);

  const postMatter = React.useMemo(() => matter(props.post.content), [props.post]);

  const onDelete = async () => {
    if (!user.access.includes(ACCESS_POST_DELETE)) {
      setVisibleDeleteModal(false);
      showNotification({
        content: '权限不足',
        theme: 'fail',
      });
      return;
    }

    await deletePost(props.post.id)
      .then(() => {
        setVisibleDeleteModal(false);
        showNotification({
          content: '删除成功',
          theme: 'success',
        });
        router.replace('/');
      })
      .catch(() => setVisibleDeleteModal(false));
  };

  return (
    <Layout errorInfo={props.errorInfo}>
      <div>
        <Terminal command={`cat ${props.post.title}`} />
        <PostTitle
          title={props.post.title}
          metaInfo={`${moment(props.post.createdAt).format('YYYY-MM-DD')} [Updated: ${moment(props.post.updatedAt).format('YYYY-MM-DD')}]`}
        />
        {props.userId !== -1 && (
          <div className={styles.editor}>
            {/* <div className="ui icon buttons"> */}
            <Link href={`/posts/editor?id=${props.post.id}`} passHref>
              <button className="ui labeled icon button orange">
                <i className="edit outline icon"></i>
                编辑
              </button>
            </Link>
            <button className="ui right labeled icon button red" onClick={async () => setVisibleDeleteModal(prev => !prev)}>
              <i className="trash icon"></i>
              删除
            </button>
          </div>
        )}
        <div className={`${styles.content} postViewer`}>
          <Viewer
            plugins={plugins.current}
            value={postMatter.content}
          />
        </div>
      </div>
      <Dialog
        open={visibleDeleteModal}
        title="提示"
        content="文章删除后无法恢复，是否继续"
        onClose={() => setVisibleDeleteModal(false)}
        actions={[
          <Button
            key="confirm"
            color="error"
            onClick={onDelete}
          >
            删除
          </Button>,
          <Button
            key="cancel"
            color="secondary"
            onClick={async () => setVisibleDeleteModal(false)}
          >
            取消
          </Button>,
        ]}
      />
    </Layout>
  );
};

export default Posts;

export const getServerSideProps = withSessionSsr(async context => {
  const [post, error] = await promiseWithError(getPostDetail(context.query.id as string));

  return {
    props: {
      post: post ? post.data.data : {
        author: {
          username: '',
        },
        labels: [],
        id: 0,
        title: '',
        content: '',
        introduction: '',
        authorId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      userId: getUserIdFromCookie(context.req as NextApiRequest),
      errorInfo: getErrorInfo(error),
    },
  };
});


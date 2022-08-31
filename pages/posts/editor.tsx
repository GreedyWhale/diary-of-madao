import type { NextPage, InferGetServerSidePropsType, NextApiRequest } from 'next';
import type { PostItem } from '~/types/services/post';
import type { Label } from '@prisma/client';
import type { Labels } from '~/types/controller/post';

import React from 'react';
import { useRouter } from 'next/router';
import { pick, isEqual } from 'lodash';
import { Editor } from '@bytemd/react';
import zhHansEditor from 'bytemd/lib/locales/zh_Hans.json';

import Layout from '~/components/Layout';
import Terminal from '~/components/Terminal';
import Button from '~/components/Button';
import Dialog from '~/components/Dialog';

import getFrontmatter from '~/plugins/getFrontmatter';
import useUser, { useUpdateUserId } from '~/utils/hooks/useUser';
import { ACCESS_POST_EDIT, LOCAL_DRAFTS } from '~/utils/constants';
import { createPost, getPostDetail, updatePost } from '~/services/post';
import { syncToGithub } from '~/services/git';
import { uploadImage } from '~/services/upload';
import { withSessionSsr, getUserIdFromCookie } from '~/utils/withSession';
import { promiseWithError } from '~/utils/promise';
import { useMarkdownPlugins } from '~/utils/hooks/useMarkdown';

import showNotification from '~/components/Notification';
import SpaceBetween from '~/components/SpaceBetween';

const getInitialFrontmatterObject = () => ({
  title: '',
  introduction: '',
  labels: [],
});
const getLabels = (newLabels: {name: string}[], oldLabels: Label[]): Labels => {
  if (!newLabels.length) {
    return [];
  }

  if (!oldLabels.length) {
    return newLabels.map(value => ({ ...value, action: 'add' }));
  }

  const labels = newLabels.map(value => {
    const index = oldLabels.findIndex(subValue => subValue.name === value.name);

    if (index !== -1) {
      const existedLabel = oldLabels.splice(index, 1);

      return {
        ...existedLabel[0],
        action: 'unchanged',
      };
    }

    return {
      ...value,
      action: 'add',
    };
  });

  return labels.concat(oldLabels.map(value => ({ ...value, action: 'delete' }))) as Labels;
};

let lastStorageTime = 0;
// eslint-disable-next-line quotes
const initialFrontmatter = "---\ntitle: '文章标题'\nlabels: ['标签一', '标签二']\nintroduction: '文章简介'\n---";

const PostEditor: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
  useUpdateUserId(props.userId);
  const router = useRouter();
  const { user, isLogged, userId } = useUser();
  const plugins = useMarkdownPlugins();

  const [value, setValue] = React.useState(initialFrontmatter);
  const [permissionDialog, setPermissionDialog] = React.useState(false);
  const [submitDialog, setSubmitDialog] = React.useState({
    open: false,
    postId: -1,
  });
  const [frontmatterObject, setFrontmatterObject] = React.useState<{
    introduction: string;
    labels: string[];
    title: string;
  }>(getInitialFrontmatterObject);

  const postBeforeUpdateRef = React.useRef<PostItem | null>(null);

  const command = React.useMemo(() => frontmatterObject.title ? `vim ${frontmatterObject.title}` : '请按照提示输入文章标题', [frontmatterObject]);
  const localStorageKey = React.useMemo(() => props.postId ? `${LOCAL_DRAFTS}_${props.postId}` : LOCAL_DRAFTS, [props.postId]);

  const onSubmit = async () => {
    const newLabels = frontmatterObject.labels.map(value => ({ name: value }));
    const oldLabels = postBeforeUpdateRef.current
      ? postBeforeUpdateRef.current.labels.map(value => ({ ...value.label }))
      : [];

    const params = {
      ...frontmatterObject,
      content: value,
      labels: getLabels(newLabels, oldLabels),
    };

    const [postInfo, postInfoError] = props.postId
      ? await promiseWithError(updatePost(props.postId as string, params))
      : await promiseWithError(createPost(params));

    if (postInfo) {
      window.localStorage.removeItem(localStorageKey);
      setSubmitDialog({
        open: true,
        postId: postInfo.data.data.id,
      });

      return;
    }

    return Promise.reject(postInfoError);
  };

  const uploadImages = async (files: File[]) => {
    const [result, error] = await promiseWithError(uploadImage(files[0]));
    if (error || !result) {
      showNotification({
        content: error.message || '上传失败',
        theme: 'fail',
      });
      return Promise.reject(error);
    }

    return [{
      url: `/static/images/posts/${result.data.data.filename}`,
      alt: result.data.data.filename,
      title: result.data.data.filename,
    }];
  };

  const goBack = async () => {
    window.localStorage.removeItem(localStorageKey);
    if (props.postId) {
      router.replace(`/posts/${router.query.id}`);
    } else {
      router.back();
    }
  };

  React.useEffect(() => {
    if (userId === -1) {
      router.replace('/');
    }
  }, [userId, router]);

  React.useEffect(() => {
    if (isLogged) {
      const canEdit = user.access.includes(ACCESS_POST_EDIT);
      if (!canEdit) {
        setPermissionDialog(true);
      }
    }
  }, [isLogged, user.access]);

  React.useEffect(() => {
    const now = Date.now();
    if ((value && value !== initialFrontmatter) && Date.now() - lastStorageTime > 30000) {
      lastStorageTime = now;
      window.localStorage.setItem(localStorageKey, JSON.stringify(value));
    }
  }, [localStorageKey, props.postId, value]);

  React.useEffect(() => {
    if (props.postId) {
      getPostDetail(props.postId as string)
        .then(result => {
          setValue(result.data.data.content);
          postBeforeUpdateRef.current = result.data.data;
        });

      return;
    }

    const localDrafts = window.localStorage.getItem(localStorageKey);

    if (localDrafts) {
      setValue(JSON.parse(localDrafts));
    }
  }, [props.postId, localStorageKey]);

  return (
    <Layout>
      <style jsx global>{`
        .bytemd {
          height: calc(100vh - 250px);
        }
      `}
      </style>
      <Terminal command={command} />
      <SpaceBetween>
        <SpaceBetween.Left>
          <Button color="normal" variant="outlined" onClick={goBack}>
            返回
          </Button>
        </SpaceBetween.Left>
        <SpaceBetween.Right>
          <>
            <Button
              color="primary"
              onClick={onSubmit}
            >
              {props.postId ? '更新' : '发布'}
            </Button>
            <Button
              color="secondary"
              variant="outlined"
              onClick={goBack}
            >
              取消
            </Button>
          </>
        </SpaceBetween.Right>
      </SpaceBetween>
      <Editor
        mode="auto"
        value={value}
        plugins={[
          ...plugins.current,
          getFrontmatter(frontmatter => {
            setFrontmatterObject(prev => {
              if (!frontmatter || typeof frontmatter === 'string') {
                return getInitialFrontmatterObject();
              }

              const pickedFrontmatterObject = {
                ...getInitialFrontmatterObject(),
                ...pick(frontmatter, ['title', 'labels', 'introduction']),
              };
              if (!prev) {
                return pickedFrontmatterObject;
              }

              const isSame = isEqual(prev, pickedFrontmatterObject);
              return isSame ? prev : pickedFrontmatterObject;
            });
          }),
        ]}
        onChange={v => setValue(v)}
        locale={zhHansEditor}
        editorConfig={{
          lineNumbers: true,
        }}
        uploadImages={uploadImages}
      />
      <Dialog
        open={permissionDialog}
        title="权限不足"
        content="当前账号权限不足，无法发布文章"
        onClose={() => router.back()}
        actions={[
          <Button key="confirm" variant="contained" color="primary" onClick={async () => router.back()}>确定</Button>,
        ]}
      />
      <Dialog
        open={submitDialog.open}
        title="提示"
        content={props.postId ? '更新成功' : '发布成功'}
        onClose={() => setSubmitDialog(prev => ({ ...prev, open: false }))}
        actions={[
          <Button color="secondary" onClick={syncToGithub} variant="outlined" key="gitSync">
            同步到GitHub
          </Button>,
          <Button
            color="primary"
            onClick={() => router.replace(`/posts/${submitDialog.postId}`)}
            key="details"
          >
            查看详情
          </Button>,
        ]}
      />
    </Layout>
  );
};

export default PostEditor;

export const getServerSideProps = withSessionSsr(async context => ({
  props: {
    postId: context.query.id || null,
    userId: getUserIdFromCookie(context.req as NextApiRequest),
  },
}));

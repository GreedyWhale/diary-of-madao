import type { NextPage } from 'next';
import type { WithSessionResult } from '~/utils/withSession';
import type { PostItem } from '~/services/post';
import type { Label } from '@prisma/client';
import type { RequestLabels } from '~/controller/post';

import React from 'react';
import { useRouter } from 'next/router';
import { Modal, Button, Icon } from 'semantic-ui-react';
import { pick, isEqual } from 'lodash';
import { Editor } from '@bytemd/react';
import zhHansEditor from 'bytemd/lib/locales/zh_Hans.json';

import Layout from '~/components/Layout';
import Terminal from '~/components/Terminal';
import CustomButton from '~/components/Button';
import styles from '~/assets/styles/postEditor.module.scss';
import getFrontmatter from '~/plugins/getFrontmatter';
import useUser, { useUpdateUserId } from '~/utils/hooks/useUser';
import { ACCESS_POST_EDIT } from '~/utils/constants';
import { createPost, getPostDetail, updatePost } from '~/services/post';
import { syncToGithub } from '~/services/git';
import { uploadImage } from '~/services/upload';
import { postValidator } from '~/utils/validator';
import { withSession } from '~/utils/withSession';
import { promiseSettled } from '~/utils/promise';
import { useMarkdownPlugins } from '~/utils/hooks/useMarkdown';
import { LOCAL_DRAFTS } from '~/utils/constants';

import showNotification from '~/components/Notification';

interface PostEditorProps {
  postId: string | undefined;
}

const getInitialFrontmatterObject = () => ({
  title: '',
  introduction: '',
  labels: [],
});
const getLabels = (newLabels: {name: string}[], oldLabels: Label[]): RequestLabels => {
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

  return labels.concat(oldLabels.map(value => ({ ...value, action: 'delete' }))) as RequestLabels;
};

let lastStorageTime = 0;
// eslint-disable-next-line quotes
const initialFrontmatter = "---\ntitle: '文章标题'\nlabels: ['标签一', '标签二']\nintroduction: '文章简介'\n---";

const PostEditor: NextPage<WithSessionResult<PostEditorProps>> = props => {
  useUpdateUserId(props.userId);
  const router = useRouter();
  const { user } = useUser();
  const plugins = useMarkdownPlugins();

  const [value, setValue] = React.useState(initialFrontmatter);
  const [permissionModal, setPermissionModal] = React.useState(false);
  const [submitModal, setSubmitModal] = React.useState({
    open: false,
    postId: -1,
  });
  const [frontmatterObject, setFrontmatterObject] = React.useState<{
    introduction: string;
    labels: string[];
    title: string;
  }>(getInitialFrontmatterObject);

  const postBeforeUpdateRef = React.useRef<PostItem>(null);

  const command = React.useMemo(() => frontmatterObject.title ? `vim ${frontmatterObject.title}` : '请按照提示输入文章标题', [frontmatterObject]);

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
    const isPassed = postValidator(params);

    if (isPassed !== true) {
      showNotification({
        content: isPassed,
        theme: 'fail',
      });
      return Promise.resolve(false);
    }

    const [postInfo, postInfoError] = props.postId
      ? await promiseSettled(updatePost(props.postId, params))
      : await promiseSettled(createPost(params));

    if (postInfo) {
      window.localStorage.removeItem(LOCAL_DRAFTS);
      setSubmitModal({
        open: true,
        postId: postInfo.data.id,
      });

      return;
    }

    return Promise.reject(postInfoError);
  };

  const uploadImages = async (files: File[]) => {
    const [result, error] = await promiseSettled(uploadImage(files[0]));
    if (error) {
      showNotification(error.message);
      return Promise.reject(error);
    }

    return [{
      url: `/static/images/posts/${result.data.filename}`,
      alt: result.data.filename,
      title: result.data.filename,
    }];
  };

  React.useEffect(() => {
    if (props.userId === -1) {
      router.replace('/');
    }
  }, [router, props.userId]);

  React.useEffect(() => {
    if (user.id !== -1) {
      const canEdit = user.access.includes(ACCESS_POST_EDIT);
      if (!canEdit) {
        setPermissionModal(true);
      }
    }
  }, [user.access, user.id]);

  React.useEffect(() => {
    if (props.postId) {
      return;
    }

    const now = Date.now();
    if ((value && value !== initialFrontmatter) && Date.now() - lastStorageTime > 30000) {
      lastStorageTime = now;
      window.localStorage.setItem(LOCAL_DRAFTS, JSON.stringify(value));
    }
  }, [props.postId, value]);

  React.useEffect(() => {
    if (props.postId) {
      getPostDetail(props.postId)
        .then(result => {
          setValue(result.data.content);
          postBeforeUpdateRef.current = result.data;
        });

      return;
    }

    const localDrafts = window.localStorage.getItem(LOCAL_DRAFTS);

    if (localDrafts) {
      setValue(JSON.parse(localDrafts));
    }
  }, [props.postId]);

  return (
    <Layout>
      <style jsx global>{`
        .bytemd {
          height: calc(100vh - 250px);
        }
      `}
      </style>
      <Terminal command={command} />
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
      <div className={styles.submitButton}>
        <CustomButton
          size="medium"
          color="green"
          inverted
          onClick={onSubmit}
        >
          <Icon name="add" />
          {props.postId ? '更新' : '发布'}
        </CustomButton>
        <CustomButton
          size="medium"
          color="purple"
          inverted
          onClick={async () => router.back()}
        >
          <Icon name="backward" />
          取消
        </CustomButton>
      </div>
      <Modal
        open={permissionModal}
        size="mini"
        header="权限不足"
        content="当前账号权限不足，无法发布文章"
        actions={[
          <Button
            key="confirm"
            color="red"
            inverted
            onClick={() => {
              setPermissionModal(false);
              router.replace('/');
            }}
          >
            回到首页
          </Button>,
        ]}
      />
      <Modal
        open={submitModal.open}
        size="mini"
      >
        <Modal.Header>提示</Modal.Header>
        <Modal.Content>
          <p>{props.postId ? '更新成功' : '发布成功'}</p>
        </Modal.Content>
        <Modal.Actions>
          <CustomButton basic color="pink" onClick={syncToGithub}>
            <Icon name="sync alternate" />
            同步到GitHub
          </CustomButton>
          <CustomButton
            basic
            color="blue"
            onClick={() => router.replace(`/posts/${submitModal.postId}`)}
          >
            <Icon name="check circle outline" />
            查看详情
          </CustomButton>
        </Modal.Actions>
      </Modal>
    </Layout>
  );
};

export default PostEditor;

export const getServerSideProps = withSession(async context => ({
  props: {
    postId: context.query.id || null,
  },
}));

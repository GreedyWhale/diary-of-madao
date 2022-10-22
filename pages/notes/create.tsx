import type { NextPage, InferGetServerSidePropsType } from 'next';
import type { FormRef } from '~/components/Form';
import type { Note } from '@prisma/client';
import type { EditorProps } from '@bytemd/react';

import React from 'react';
import { useRouter } from 'next/router';
import { Editor } from '@bytemd/react';
import { isEqual } from 'lodash';
import breaks from '@bytemd/plugin-breaks';
import frontmatter from '@bytemd/plugin-frontmatter';
import gemoji from '@bytemd/plugin-gemoji';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight-ssr';
import math from '@bytemd/plugin-math';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import mermaid from '@bytemd/plugin-mermaid';
import zhHans from 'bytemd/locales/zh_Hans.json';
import zhHansGfm from '@bytemd/plugin-gfm/locales/zh_Hans.json';
import zhHansMath from '@bytemd/plugin-math/locales/zh_Hans.json';
import zhHansMermaid from '@bytemd/plugin-mermaid/locales/zh_Hans.json';
import 'bytemd/dist/index.min.css';
import 'katex/dist/katex.min.css';
import 'github-markdown-css/github-markdown-dark.css';
import 'highlight.js/styles/base16/unikitty-dark.css';

import styles from '~/assets/styles/pages/notes/create.module.scss';
import AddIcon from '~/assets/images/add.svg';
import { Terminal } from '~/components/Terminal';
import { Model } from '~/components/Modal';
import { Form } from '~/components/Form';
import { FormItem } from '~/components/FormItem';
import { Button } from '~/components/Button';

import submitPlugin from '~/lib/bytemdPlugins/submit';
import goBackPlugin from '~/lib/bytemdPlugins/goBack';
import getFrontmatter from '~/lib/bytemdPlugins/getFrontmatter';
import { createNote } from '~/services/note';
import { useUserId } from '~/hooks/useUser';
import { withSessionSsr } from '~/lib/withSession';
import { NOTE_CATEGORY } from '~/lib/constants';
import { upload } from '~/services/upload';

type FormDataType = {
  category: Note['category'];
  labels: Array<{ label: string; value: string; }>;
};

const plugins = [
  breaks(),
  frontmatter(),
  gemoji(),
  gfm({ locale: zhHansGfm }),
  highlight(),
  math({ locale: zhHansMath }),
  mediumZoom(),
  mermaid({ locale: zhHansMermaid }),
];

const initialFrontmatter: Record<'title' | 'introduction', string> = {
  title: '',
  introduction: '',
};

const CreateNotes: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
  useUserId(props.userId);
  const router = useRouter();
  const [value, setValue] = React.useState('---\ntitle: \'文章标题\'\nintroduction: \'文章简介\'\n---');
  const [frontmatterValue, setFrontmatterValue] = React.useState(initialFrontmatter);
  const [visibleSubmitModal, setVisibleSubmitModal] = React.useState(false);
  const [visibleCreateLabelModal, setVisibleCreateLabelModal] = React.useState(false);
  const submitFormRef = React.useRef<FormRef>({
    validator: () => true,
    getFormValues: () => ({}),
  });

  const fetchFrontmatterValue = (values: typeof initialFrontmatter) => {
    if (isEqual(values, frontmatterValue)) {
      return;
    }

    setFrontmatterValue(values);
  };

  const submitNotes = async (el: React.MouseEvent<HTMLButtonElement>) => {
    el.preventDefault();

    if (submitFormRef.current.validator()) {
      const formData = submitFormRef.current.getFormValues() as FormDataType;
      await createNote({
        labels: formData.labels.map(label => label.value),
        title: frontmatterValue.title,
        introduction: frontmatterValue.introduction,
        content: value,
        category: formData.category,
      });

      console.log('成功');
    }
  };

  const uploadImages: EditorProps['uploadImages'] = async file => {
    const image = await upload(file[0]);
    return [{
      alt: image.data.resource?.originalname,
      title: image.data.resource?.originalname,
      url: `/public/upload/${(image.data.resource?.filename ?? '')}`,
    }];
  };

  return (
    <div className={styles.container}>
      <style jsx global>{`
        .bytemd {
          height: calc(100vh - 250px);
        }
      `}
      </style>
      <Terminal command={`vim ${frontmatterValue.title}`} />

      <Editor
        mode='auto'
        locale={zhHans}
        value={value}
        onChange={value => { setValue(value); }}
        plugins={[
          ...plugins,
          submitPlugin(() => { setVisibleSubmitModal(true); }),
          goBackPlugin(() => { router.replace('/'); }),
          getFrontmatter(fetchFrontmatterValue),
        ]}
        uploadImages={uploadImages}
      />

      {visibleSubmitModal && (
        <Model hideButtons title='提交笔记'>
          <Form
            ref={submitFormRef}
            className={styles.submit_form}
            customButtons={
              <div className={styles.form_buttons}>
                <Button key='cancel' theme='secondary' onClick={async () => { setVisibleSubmitModal(false); }}>取消</Button>
                <Button key='confirm' theme='default' onClick={submitNotes}>提交</Button>
              </div>
            }
          >
            <FormItem
              label='选择笔记类型'
              name='category'
              type='radio'
              options={[
                { label: '技术笔记', value: NOTE_CATEGORY[0] },
                { label: '读书笔记', value: NOTE_CATEGORY[1] },
              ]}
              validator={{
                message: '必选',
                require: true,
              }}
            />
            <FormItem
              className={styles.labels_item}
              label={
                <div className={styles.checkbox_label}>
                  选择标签 <AddIcon className={styles.add_icon} onClick={() => { setVisibleCreateLabelModal(true); }} />
                </div>
              }
              name='labels'
              type='checkbox'
              options={[{ label: '测试', value: 'test' }]}
              validator={{
                message: '必选',
                require: true,
              }}
            />
          </Form>
        </Model>
      )}

      {visibleCreateLabelModal && (
        <Model hideButtons title='创建标签'>
          <Form
            onFinish={async () => { console.log(''); }}
            className={styles.label_form}
          >
            <FormItem
              label='标签名'
              name='labelName'
              type='text'
              validator={{ message: '必填', require: true }}
            />
          </Form>
        </Model>
      )}
    </div>
  );
};

export const getServerSideProps = withSessionSsr(async context => ({
  props: {
    userId: context.req.session.user?.id ?? 0,
  },
}));

export default CreateNotes;

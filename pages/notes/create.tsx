import type { NextPage, InferGetServerSidePropsType } from 'next';
import type { FormRef } from '~/components/Form';
import type { Note } from '@prisma/client';
import type { EditorProps } from '@bytemd/react';

import React from 'react';
import { useRouter } from 'next/router';
import { Editor } from '@bytemd/react';
import { isEqual } from 'lodash';
import zhHans from 'bytemd/locales/zh_Hans.json';

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
import { useUpdateUserId } from '~/hooks/useUser';
import { withSessionSsr } from '~/lib/withSession';
import { NOTE_CATEGORY } from '~/lib/constants';
import { upload } from '~/services/upload';
import { useMarkdown } from '~/hooks/useMarkdown';

type FormDataType = {
  category: Note['category'];
  labels: Array<{ label: string; value: string; }>;
};

const initialFrontmatter: Record<'title' | 'introduction', string> = {
  title: '',
  introduction: '',
};

const CreateNotes: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
  useUpdateUserId(props.userId);
  const router = useRouter();
  const { plugins } = useMarkdown();
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

      <div className='markdown-wrap'>
        <Editor
          mode='auto'
          locale={zhHans}
          value={value}
          onChange={value => { setValue(value); }}
          plugins={[
            ...plugins.current,
            submitPlugin(() => { setVisibleSubmitModal(true); }),
            goBackPlugin(() => { router.replace('/'); }),
            getFrontmatter(fetchFrontmatterValue),
          ]}
          uploadImages={uploadImages}
        />
      </div>

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
            className={styles.label_form}
            customButtons={
              <div className={styles.label_form_buttons}>
                <Button theme='secondary' onClick={async () => setVisibleCreateLabelModal(false)}>取消</Button>
                <Button>创建</Button>
              </div>
            }
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

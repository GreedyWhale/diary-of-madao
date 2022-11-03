import type { NextPage, InferGetServerSidePropsType } from 'next';
import type { FormRef } from '~/components/Form';
import type { Note } from '@prisma/client';
import type { EditorProps } from '@bytemd/react';
import type { FormItemProps } from '~/components/FormItem';

import React from 'react';
import { useRouter } from 'next/router';
import { Editor } from '@bytemd/react';
import { isEqual } from 'lodash';
import zhHans from 'bytemd/locales/zh_Hans.json';

import styles from '~/assets/styles/pages/notes/create.module.scss';
import AddIcon from '~/assets/images/add.svg';
import { Terminal } from '~/components/Terminal';
import { Model, showModal } from '~/components/Modal';
import { Form } from '~/components/Form';
import { FormItem } from '~/components/FormItem';
import { Button } from '~/components/Button';
import showNotification from '~/components/Notification';

import submitPlugin from '~/lib/bytemdPlugins/submit';
import goBackPlugin from '~/lib/bytemdPlugins/goBack';
import getFrontmatter from '~/lib/bytemdPlugins/getFrontmatter';
import { createNote, getNoteDetails, updateNote } from '~/services/note';
import { useUpdateUserId } from '~/hooks/useUser';
import { withSessionSsr } from '~/lib/withSession';
import { NOTE_CATEGORY, LOCAL_NOTE_DRAFTS } from '~/lib/constants';
import { upload } from '~/services/upload';
import { useMarkdown } from '~/hooks/useMarkdown';
import { getNumberFromString } from '~/lib/number';
import { syncToGithub } from '~/services/git';
import { createLabel, getLabels } from '~/services/label';

type FormDataType = {
  category: Note['category'];
  labels: Array<{ label: string; value: string; }>;
};

type LabelFormDataType = {
  labelName: string;
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
  const [labels, setLabels] = React.useState<FormItemProps['options']>([]);
  const [frontmatterValue, setFrontmatterValue] = React.useState(initialFrontmatter);
  const [visibleSubmitModal, setVisibleSubmitModal] = React.useState(false);
  const [visibleCreateLabelModal, setVisibleCreateLabelModal] = React.useState(false);

  const isUpdateMode = React.useMemo(() => props.noteDetails?.resource?.authorId === props.userId, [props.noteDetails, props.userId]);
  const fetchLabels = React.useCallback(async () => {
    const result = await getLabels();
    setLabels(result.data.resource?.map(item => ({ label: item.name, value: item.name })));
  }, []);

  const submitFormRef = React.useRef<FormRef>({
    validator: () => true,
    getFormValues: () => ({}),
  });

  const labelFormRef = React.useRef<FormRef>({
    validator: () => true,
    getFormValues: () => ({}),
  });

  const fetchFrontmatterValue = (values: typeof initialFrontmatter) => {
    if (isEqual(values, frontmatterValue)) {
      return;
    }

    setFrontmatterValue(values);
  };

  const submitNote = async (el: React.MouseEvent<HTMLButtonElement>) => {
    el.preventDefault();

    if (submitFormRef.current.validator()) {
      const formData = submitFormRef.current.getFormValues() as FormDataType;
      const params = {
        labels: formData.labels.map(label => label.value),
        title: frontmatterValue.title,
        introduction: frontmatterValue.introduction,
        content: value,
        category: formData.category,
      };
      let id = 0;

      if (isUpdateMode) {
        id = (await updateNote(props.noteId, params)).data.resource!.id;
      } else {
        id = (await createNote(params)).data.resource!.id;
      }

      window.localStorage.removeItem(LOCAL_NOTE_DRAFTS);
      setVisibleSubmitModal(false);
      showModal({
        content: isUpdateMode ? '更新成功' : '创建成功',
        buttons: [
          { content: '查看详情', theme: 'secondary' },
          { content: '同步至 GitHub' },
        ],
        async onClick(index) {
          if (index) {
            await syncToGithub();
            showNotification({ content: '同步成功', theme: 'success' });
          }

          router.replace(`/notes/${id}`);
        },
      });
    }
  };

  const submitLabel = async (el: React.MouseEvent<HTMLButtonElement>) => {
    el.preventDefault();

    if (labelFormRef.current.validator()) {
      const formData = labelFormRef.current.getFormValues() as LabelFormDataType;
      await createLabel({ label: formData.labelName });
      await fetchLabels();
      showNotification({ content: '创建成功', theme: 'success' });
      setVisibleCreateLabelModal(false);
    }
  };

  const uploadImages: EditorProps['uploadImages'] = async file => {
    const image = await upload(file[0]);
    return [{
      alt: image.data.resource?.originalname,
      title: image.data.resource?.originalname,
      url: `/_next/upload/${(image.data.resource?.filename ?? '')}`,
    }];
  };

  React.useEffect(() => {
    const localDrafts = window.localStorage.getItem(LOCAL_NOTE_DRAFTS);
    if (props.noteDetails?.resource?.content) {
      setValue(props.noteDetails?.resource?.content);
    } else if (localDrafts) {
      setValue(JSON.parse(localDrafts));
    }
  }, [props.noteDetails]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      if (value) {
        window.localStorage.setItem(LOCAL_NOTE_DRAFTS, JSON.stringify(value));
      }
    }, 30000);

    return () => window.clearTimeout(timer);
  }, [value]);

  React.useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

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
                <Button key='confirm' theme='default' onClick={submitNote}>提交</Button>
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
              options={labels}
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
            ref={labelFormRef}
            className={styles.label_form}
            customButtons={
              <div className={styles.label_form_buttons}>
                <Button theme='secondary' onClick={async () => setVisibleCreateLabelModal(false)}>取消</Button>
                <Button onClick={submitLabel}>创建</Button>
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

export const getServerSideProps = withSessionSsr(async context => {
  const noteId = getNumberFromString(context.query.id);
  const noteDetails = noteId ? await getNoteDetails(noteId) : null;
  return {
    props: {
      noteId,
      userId: context.req.session.user?.id ?? 0,
      noteDetails: noteDetails ? noteDetails?.data : null,
    },
  };
});

export default CreateNotes;

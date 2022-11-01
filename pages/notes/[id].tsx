import type { NextPage, InferGetServerSidePropsType } from 'next';

import React from 'react';
import { useRouter } from 'next/router';
import { Viewer } from '@bytemd/react';

import styles from '~/assets/styles/pages/notes/details.module.scss';
import { Terminal } from '~/components/Terminal';
import { Button } from '~/components/Button';

import { withSessionSsr } from '~/lib/withSession';
import { getNoteDetails } from '~/services/note';
import { getNumberFromString } from '~/lib/number';
import { useMarkdown } from '~/hooks/useMarkdown';
import { useUser, useUpdateUserId } from '~/hooks/useUser';
import { formatDate } from '~/lib/date';

const NoteDetails: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
  useUpdateUserId(props.userId);
  const router = useRouter();
  const { user } = useUser();
  const { plugins } = useMarkdown();

  return (
    <div className={styles.container}>
      <Terminal command={`cat ${12312}`} />

      <div className={styles.header}>
        <h1>{props.noteDetails?.resource?.title}</h1>
        <div>{formatDate(props.noteDetails?.resource?.createdAt)} [Updated: {formatDate(props.noteDetails?.resource?.updatedAt)}]</div>
      </div>

      {user?.id === props.noteDetails?.resource?.authorId && (
        <div className={styles.buttons}>
          <Button onClick={async () => router.back()}>返回</Button>
          {user?.id === props.noteDetails?.resource?.authorId && (
            <div className={styles.right}>
              <Button theme='secondary'>删除</Button>
              <Button onClick={async () => router.push(`/notes/create?id=${props.noteDetails!.resource!.id}`)}>编辑</Button>
            </div>
          )}
        </div>
      )}
      <div className='markdown-wrap markdown-viewer-wrap'>
        <Viewer
          value={props.noteDetails?.resource?.content ?? ''}
          plugins={[...plugins.current]}
        />
      </div>
    </div>
  );
};

export default NoteDetails;

export const getServerSideProps = withSessionSsr(async context => {
  const id = getNumberFromString(context.query.id);
  const noteDetails = id ? await getNoteDetails(id) : null;

  return {
    props: {
      userId: context.req.session.user?.id ?? 0,
      noteDetails: noteDetails ? noteDetails.data : null,
    },
  };
});

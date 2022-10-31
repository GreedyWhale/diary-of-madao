import type { NextPage, InferGetServerSidePropsType } from 'next';

import React from 'react';
import { Viewer } from '@bytemd/react';

import styles from '~/assets/styles/pages/notes/details.module.scss';
import { Terminal } from '~/components/Terminal';

import { withSessionSsr } from '~/lib/withSession';
import { getNoteDetails } from '~/services/note';
import { getNumberFromString } from '~/lib/number';
import { useMarkdown } from '~/hooks/useMarkdown';

const NoteDetails: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
  const { plugins } = useMarkdown();

  return (
    <div className={styles.container}>
      <Terminal command={`cat ${12312}`} />

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
      noteDetails: noteDetails ? noteDetails.data : null,
    },
  };
});

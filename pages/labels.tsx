import type { NextPage, InferGetServerSidePropsType } from 'next';

import React from 'react';
import { useRouter } from 'next/router';

import styles from '~/assets/styles/pages/labels.module.scss';

import { withSessionSsr } from '~/lib/withSession';
import { getLabels } from '~/services/label';

const Labels: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
  const router = useRouter();

  return (
    <ul className={styles.container}>
      {props.labels?.resource?.map(item => (
        <li key={item.id} onClick={async () => router.push(`/notes/list/labelId/${item.id}`)}>{item.name} ({item.notes.length})</li>
      ))}
    </ul>
  );
};

export const getServerSideProps = withSessionSsr(async context => {
  const labels = await getLabels();

  return {
    props: {
      userId: context.req.session.user?.id ?? 0,
      labels: labels ? labels.data : null,
    },
  };
});

export default Labels;

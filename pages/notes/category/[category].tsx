import type { NextPage, InferGetServerSidePropsType } from 'next';
import type { Category } from '@prisma/client';

import React from 'react';
import { useRouter } from 'next/router';

import { Card } from '~/components/Card';
import { Pagination } from '~/components/Pagination';

import { withSessionSsr } from '~/lib/withSession';
import { useUpdateUserId } from '~/hooks/useUser';
import { getNotes } from '~/services/note';
import { getNumberFromString } from '~/lib/number';
import { PAGE_SIZE } from '~/lib/constants';

const NotesCategory: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
  useUpdateUserId(props.userId);
  const router = useRouter();

  console.log(props.notes);

  return (
    <div>
      <div>
        {props.notes?.resource?.list.map(note => (
          <Card key={note.id} {...note} />
        ))}
      </div>

      {props.notes?.resource?.pagination.totalPage
        ? (
          <Pagination
            total={props.notes.resource.pagination.totalPage}
            current={1}
            pageSize={PAGE_SIZE}
            onClick={async index => router.push(`/?page=${index}`)}
          />
        )
        : <></>
      }
    </div>
  );
};

export const getServerSideProps = withSessionSsr(async context => {
  const currentPage = getNumberFromString(context.query.page) || 1;
  const notes = await getNotes({
    page: currentPage,
    pageSize: PAGE_SIZE,
    category: context.query.category ? ((context.query.category as string).toLocaleUpperCase() as Category) : undefined,
  });

  return {
    props: {
      userId: context.req.session.user?.id ?? 0,
      notes: notes ? notes.data : null,
      currentPage,
    },
  };
});

export default NotesCategory;

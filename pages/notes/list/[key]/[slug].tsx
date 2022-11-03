import type { NextPage, InferGetServerSidePropsType } from 'next';
import type { Category } from '@prisma/client';
import type { GetNotesParams } from '~/model/note';

import React from 'react';
import { useRouter } from 'next/router';

import { Card } from '~/components/Card';
import { Pagination } from '~/components/Pagination';

import { withSessionSsr } from '~/lib/withSession';
import { useUpdateUserId } from '~/hooks/useUser';
import { getNotes } from '~/services/note';
import { getNumberFromString } from '~/lib/number';
import { PAGE_SIZE } from '~/lib/constants';

const NoteList: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
  useUpdateUserId(props.userId);
  const router = useRouter();

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
  const { key, slug, page } = context.query;
  const currentPage = getNumberFromString(page) || 1;
  const queryParams: Pick<GetNotesParams, 'labelId' | 'category'> = {
    category: undefined,
    labelId: 0,
  };
  switch (key) {
    case 'category':
      queryParams.category = ((slug as string).toLocaleUpperCase() as Category);
      break;

    case 'labelId':
      queryParams.labelId = getNumberFromString(slug);
      break;

    default:
      break;
  }

  const notes = await getNotes({
    page: currentPage,
    pageSize: PAGE_SIZE,
    ...queryParams,
  });

  return {
    props: {
      userId: context.req.session.user?.id ?? 0,
      notes: notes ? notes.data : null,
      currentPage,
    },
  };
});

export default NoteList;

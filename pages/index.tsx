import type { NextPage, InferGetServerSidePropsType } from 'next';

import React from 'react';
import { useImmer } from 'use-immer';
import { useRouter } from 'next/router';

import styles from '~/assets/styles/pages/home.module.scss';
import EmailIcon from '~/assets/images/email.svg';
import GithubIcon from '~/assets/images/github.svg';
import { Card } from '~/components/Card';
import { Pagination } from '~/components/Pagination';

import { withSessionSsr } from '~/lib/withSession';
import { useUpdateUserId } from '~/hooks/useUser';
import { getNotes } from '~/services/note';
import { getNumberFromString } from '~/lib/number';

type WelcomeType = {
  rawData: {
    title: string[];
    description: string[][];
    icons: Array<{ component: React.ReactNode; key: string; }>;
    titleIndex: number;
    descriptionIndex: {
      index: number;
      subIndex: number;
    };
    iconsIndex: number;
  };
  title: string;
  description: string[];
  icons: Array<{ component: React.ReactNode; key: string; }>;
};

const pageSize = 7;

const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
  useUpdateUserId(props.userId);
  const router = useRouter();

  const [welcome, setWelcome] = useImmer<WelcomeType>({
    rawData: {
      title: ['你', '好', '👋'],
      description: [
        ['欢', '迎', '来', '到', '牢', '骚', '百', '物', '语', '，', '这', '里', '记', '录', '了', '我', '的', '技', '术', '笔', '记', '和', '一', '些', '学', '读', '书', '记', '，', '希', '望', '可', '以', '帮', '到', '你', '^', '_', '^'],
        ['我', '是', '一', '名', '前', '端', '工', '程', '师', '，', '喜', '欢', '宅', '家', '🤗', '、', '游', '戏', '🎮', '和', '动', '漫', '🍥'],
        ['目', '前', '在', '广', '州', '工', '作', '，', '可', '以', '通', '过', '下', '面', '方', '式', '联', '系', '到', '我', '👇'],
      ],
      icons: [
        { key: 'email', component: <EmailIcon className={styles.icon} /> },
        { key: 'github', component: <GithubIcon className={styles.icon} /> },
      ],
      titleIndex: 0,
      descriptionIndex: {
        index: 0,
        subIndex: 0,
      },
      iconsIndex: 0,
    },
    title: '',
    description: [],
    icons: [],
  });

  const typewritersTasks = React.useCallback(() => {
    const delay = 100;
    const {
      title,
      titleIndex,
      description,
      descriptionIndex,
      icons,
      iconsIndex,
    } = welcome.rawData;
    let { index, subIndex } = descriptionIndex;
    let timer = -1;
    let abort = false;

    const handleFinished = (resolve: (value: unknown) => void, reject: () => void) => {
      window.clearTimeout(timer);
      if (abort) {
        reject();
        return;
      }

      resolve(true);
    };

    const updateTitle = async () => new Promise((resolve, reject) => {
      if (titleIndex === title.length) {
        handleFinished(resolve, reject);
        return;
      }

      timer = window.setTimeout(() => {
        setWelcome(draft => {
          draft.title += draft.rawData.title[titleIndex];
          draft.rawData.titleIndex += 1;
        });
      }, delay);
    });

    const updateDescription = async () => new Promise((resolve, reject) => {
      if (index === description.length) {
        handleFinished(resolve, reject);
        return;
      }

      const isNextLine = subIndex === description[index].length;
      if (isNextLine) {
        index += 1;
        subIndex = 0;
      }

      if (index === description.length) {
        handleFinished(resolve, reject);
        return;
      }

      timer = window.setTimeout(() => {
        setWelcome(draft => {
          draft.description[index] = (draft.description[index] || '') + draft.rawData.description[index][subIndex];
          draft.rawData.descriptionIndex = {
            index,
            subIndex: subIndex + 1,
          };
        });
      }, delay);
    });

    const updateIcons = async () => new Promise((resolve, reject) => {
      if (icons.length === iconsIndex) {
        handleFinished(resolve, reject);
        return;
      }

      timer = window.setTimeout(() => {
        setWelcome(draft => {
          draft.icons.push(draft.rawData.icons[iconsIndex]);
          draft.rawData.iconsIndex += 1;
        });
      }, delay);
    });

    const handler = async () => {
      try {
        await updateTitle();
        await updateDescription();
        await updateIcons();
      } catch (error) {}
    };

    handler();

    return () => {
      window.clearTimeout(timer);
      abort = true;
    };
  }, [setWelcome, welcome.rawData]);

  React.useEffect(() => {
    const unsubscribe = typewritersTasks();
    return unsubscribe;
  }, [typewritersTasks]);

  console.log(props.notes);

  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <h1>{welcome.title}</h1>
        {welcome.description.map(value => (
          <p key={value}>{value}</p>
        ))}
        <ul className={styles.icon_wrap}>
          {welcome.icons.map(value => (
            <li key={value.key}>
              {value.component}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.notes}>
        {props.notes?.resource?.list.map(note => (
          <Card key={note.id} {...note} />
        ))}
      </div>

      {props.notes?.resource?.pagination.totalPage
        ? (
          <Pagination
            total={props.notes.resource.pagination.totalPage}
            current={1}
            pageSize={pageSize}
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
    pageSize,
  });

  return {
    props: {
      userId: context.req.session.user?.id ?? 0,
      notes: notes ? notes.data : null,
      currentPage,
    },
  };
});

export default Home;

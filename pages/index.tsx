import type { NextPage } from 'next';

import React from 'react';
import { useImmer } from 'use-immer';

import styles from '~/assets/styles/pages/home.module.scss';
import EmailIcon from '~/assets/images/email.svg';
import GithubIcon from '~/assets/images/github.svg';

type WelcomeType = {
  rawData: {
    title: string[];
    description: string[][];
    icons: Array<{ component: React.ReactNode; key: string }>;
    titleIndex: number;
    descriptionIndex: {
      index: number;
      subIndex: number;
    };
    iconsIndex: number;
  };
  title: string;
  description: string[];
  icons: Array<{ component: React.ReactNode; key: string }>;
};

const Home: NextPage = () => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState<string[]>([]);
  const [welcome, setWelcome] = useImmer<WelcomeType>({
    rawData: {
      title: ['你', '好', '👋'],
      description: [
        ['欢', '迎', '来', '到', '牢', '骚', '百', '物', '语', '，', '这', '里', '记', '录', '了', '我', '的', '技', '术', '笔', '记', '和', '一', '些', '学', '习', '笔', '记', '，', '希', '望', '可', '以', '帮', '到', '你', '^', '_', '^'],
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

  const updateTitle = React.useCallback(() => {
    const { title, titleIndex } = welcome.rawData;
    let timer = -1;
    if (titleIndex === title.length) {
      return;
    }

    timer = window.setTimeout(() => {
      setWelcome(draft => {
        draft.title += draft.rawData.title[titleIndex];
        draft.rawData.titleIndex += 1;
      });
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [setWelcome, welcome.rawData]);

  const updateDescription = React.useCallback(() => {
    const {
      description,
      descriptionIndex,
      title,
      titleIndex,
    } = welcome.rawData;
    let { index, subIndex } = descriptionIndex;
    let timer = -1;
    if (title.length !== titleIndex || index === description.length) {
      return;
    }

    const isNextLine = subIndex === description[index].length;
    if (isNextLine) {
      index += 1;
      subIndex = 0;
    }

    if (index === description.length) {
      setWelcome(draft => { draft.rawData.descriptionIndex.index = index; });
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
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [setWelcome, welcome.rawData]);

  const updateIcons = React.useCallback(() => {
    const { icons, iconsIndex, descriptionIndex: { index }, description } = welcome.rawData;
    let timer = -1;
    if (description.length !== index || icons.length === iconsIndex) {
      return;
    }

    timer = window.setTimeout(() => {
      setWelcome(draft => {
        draft.icons.push(draft.rawData.icons[iconsIndex]);
        draft.rawData.iconsIndex += 1;
      });
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [setWelcome, welcome.rawData]);

  React.useEffect(() => {
    const unsubscribe = updateTitle();
    return unsubscribe;
  }, [updateTitle]);

  React.useEffect(() => {
    const unsubscribe = updateDescription();
    return unsubscribe;
  }, [updateDescription]);

  React.useEffect(() => {
    const unsubscribe = updateIcons();
    return unsubscribe;
  }, [updateIcons]);

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

    </div>
  );
};

export default Home;

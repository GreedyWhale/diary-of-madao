import type { NextPage } from 'next';

import React from 'react';
import { Editor } from '@bytemd/react';
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

import styles from '~/assets/styles/pages/notes/create.module.scss';
import { Terminal } from '~/components/Terminal';

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

const CreateNotes: NextPage = () => {
  const [value, setValue] = React.useState('');
  console.log('renderer');

  return (
    <div className={styles.container}>
      <style jsx global>{`
        .bytemd {
          height: calc(100vh - 250px);
        }
      `}
      </style>
      <Terminal command='vim' />

      <Editor
        mode='auto'
        locale={zhHans}
        value={value}
        onChange={value => { setValue(value); }}
        plugins={plugins}
      />
    </div>
  );
};

export default CreateNotes;

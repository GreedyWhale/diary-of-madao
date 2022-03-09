/*
 * @Description: markdown 编辑器和查看器
 * @Author: MADAO
 * @Date: 2021-10-16 15:01:20
 * @LastEditors: MADAO
 * @LastEditTime: 2022-03-09 16:57:54
 */
import React from 'react';
import gfm from '@bytemd/plugin-gfm';
import breaks from '@bytemd/plugin-breaks';
import footnotes from '@bytemd/plugin-footnotes';
import frontmatter from '@bytemd/plugin-frontmatter';
import gemoji from '@bytemd/plugin-gemoji';
import highlight from '@bytemd/plugin-highlight-ssr';
import math from '@bytemd/plugin-math';
import mermaid from '@bytemd/plugin-mermaid';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import zhHansGfm from '@bytemd/plugin-gfm/lib/locales/zh_Hans.json';
import zhHansMath from '@bytemd/plugin-math/lib/locales/zh_Hans.json';
import zhHansMathMermaid from '@bytemd/plugin-mermaid/lib/locales/zh_Hans.json';
import 'bytemd/dist/index.min.css';
import 'katex/dist/katex.css';
import 'github-markdown-css/github-markdown-dark.css';
import 'highlight.js/styles/gradient-dark.css';

import showNotification from '~/components/Notification';
import { promiseWithError } from '~/utils/promise';

export function useMarkdownPlugins() {
  const plugins = React.useRef([
    gfm({ locale: zhHansGfm }),
    breaks(),
    footnotes(),
    frontmatter(),
    gemoji(),
    highlight(),
    math({
      locale: zhHansMath,
    }),
    mermaid({ locale: zhHansMathMermaid }),
    mediumZoom(),
  ]);

  return plugins;
}

export function useMarkdownCopyButton() {
  const getButtonElement = () => {
    const button = document.createElement('button');
    button.innerText = 'Copy';
    button.classList.add('copy-button');
    button.addEventListener('click', async event => {
      const children = (event.target as HTMLElement).parentElement?.children;
      if (!children) {
        return;
      }

      const { innerText } = Array.from(children)[0] as HTMLElement;
      const error = (await promiseWithError(navigator.clipboard.writeText(innerText)))[1];
      showNotification({
        content: error ? error.message : '复制成功',
        theme: error ? 'fail' : 'success',
      });
    });
    return button;
  };

  const addButtonToCodeBlock = React.useCallback(() => {
    const codeBlocks = Array.from(document.querySelectorAll('pre'));
    if (codeBlocks.length) {
      codeBlocks.forEach(element => {
        element.appendChild(getButtonElement());
      });
    }
  }, []);

  React.useEffect(() => {
    addButtonToCodeBlock();
  }, [addButtonToCodeBlock]);
}

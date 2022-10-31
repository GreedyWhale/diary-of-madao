/*
 * @Description: bytemd相关hook
 * @Author: MADAO
 * @Date: 2022-10-31 21:30:32
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-31 21:33:02
 */
import React from 'react';
import breaks from '@bytemd/plugin-breaks';
import frontmatter from '@bytemd/plugin-frontmatter';
import gemoji from '@bytemd/plugin-gemoji';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight-ssr';
import math from '@bytemd/plugin-math';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import mermaid from '@bytemd/plugin-mermaid';
import zhHansGfm from '@bytemd/plugin-gfm/locales/zh_Hans.json';
import zhHansMath from '@bytemd/plugin-math/locales/zh_Hans.json';
import zhHansMermaid from '@bytemd/plugin-mermaid/locales/zh_Hans.json';
import 'bytemd/dist/index.min.css';
import 'katex/dist/katex.min.css';
import 'github-markdown-css/github-markdown-dark.css';
import 'highlight.js/styles/base16/unikitty-dark.css';

export const useMarkdown = () => {
  const plugins = React.useRef([
    breaks(),
    frontmatter(),
    gemoji(),
    gfm({ locale: zhHansGfm }),
    highlight(),
    math({ locale: zhHansMath }),
    mediumZoom(),
    mermaid({ locale: zhHansMermaid }),
  ]);

  return { plugins };
};

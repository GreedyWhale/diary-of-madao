/*
 * @Description: markdown 编辑器和查看器
 * @Author: MADAO
 * @Date: 2021-10-16 15:01:20
 * @LastEditors: MADAO
 * @LastEditTime: 2021-11-24 16:06:56
 */
import React from 'react';
import gfm from '@bytemd/plugin-gfm';
import breaks from '@bytemd/plugin-breaks';
import footnotes from '@bytemd/plugin-footnotes';
import frontmatter from '@bytemd/plugin-frontmatter';
import gemoji from '@bytemd/plugin-gemoji';
import highlight from '@bytemd/plugin-highlight';
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

export function useMarkdownPlugins() {
  const plugins = React.useRef([
    gfm({ locale: zhHansGfm }),
    breaks(),
    footnotes(),
    frontmatter(),
    gemoji(),
    highlight(),
    math({
      locale: zhHansMath
    }),
    mermaid({ locale: zhHansMathMermaid }),
    mediumZoom()
  ]);

  return plugins;
}

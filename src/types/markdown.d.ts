import type { AstroComponentFactory } from 'astro/runtime/server/index.d.ts';
import type { ImageMetadata } from 'astro';

export interface MarkdownFrontmatter {
  title: string;
  subtitle: string;
  birthtime: string;
  lastModified: string;
  author: string;
  tags: string[];
  type: string;
  cover: ImageMetadata;
}


export interface MarkdownInstance {
  /* 该文件的 YAML frontmatter 中指定的任何数据 */
  frontmatter: MarkdownFrontmatter;
  /* 该文件的绝对文件路径 */
  file: string;
  /* 该文件的渲染路径 */
  url: string | undefined;
  /* 渲染此文件内容的 Astro 组件 */
  Content: AstroComponentFactory;
  /** （仅限 Markdown）原始 Markdown 文件内容，不包括布局 HTML 和 YAML frontmatter */
  rawContent(): string;
  /** （仅限 Markdown）将 Markdown 文件编译为 HTML，不包括布局 HTML */
  compiledContent(): string;
  /* 返回此文件中的 h1...h6 元素数组的函数 */
  getHeadings(): Promise<{ depth: number; slug: string; text: string }[]>;
  default: AstroComponentFactory;
}

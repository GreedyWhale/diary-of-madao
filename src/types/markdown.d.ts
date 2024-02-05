/*
 * @Description: markdown 相关类型声明
 * @Author: MADAO
 * @Date: 2024-02-05 11:05:23
 * @LastEditors: MADAO
 * @LastEditTime: 2024-02-05 11:13:08
 */
export interface MarkdownFileInfo {
  url: string;
  frontmatter: {
    title: string;
    author: string;
    description: string;
    tag: string;
  };
}

/*
 * @Description: 从bytemd中获取frontmatter
 * @Author: MADAO
 * @Date: 2021-08-03 17:52:45
 * @LastEditors: MADAO
 * @LastEditTime: 2021-08-03 18:08:31
 */

import type { BytemdPlugin } from 'bytemd';

export default function getFrontmatter(callback: (_frontmatter: string | object) => void): BytemdPlugin {
  return {
    viewerEffect: ({ file }) => {
      if (file.frontmatter) {
        callback(file.frontmatter);
      }
    }
  };
}

/*
 * @Description: https://github.com/bytedance/bytemd/issues/224
 * @Author: MADAO
 * @Date: 2022-10-11 00:21:26
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-17 22:28:08
 */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare module 'vfile' {
  interface VFile {
    frontmatter: string | Record<string, string> | undefined;
  }
}

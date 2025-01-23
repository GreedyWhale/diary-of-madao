/*
 * @Description: https://docs.astro.build/zh-cn/recipes/modified-time/#%E6%93%8D%E4%BD%9C%E6%AD%A5%E9%AA%A4
 * @Author: MADAO
 * @Date: 2025-01-20 14:25:14
 * @LastEditors: MADAO
 * @LastEditTime: 2025-01-20 14:33:41
 */
import { statSync } from "fs";

export function remarkModifiedTime() {
  return function (tree, file) {
    const filepath = file.history[0];
    const result = statSync(filepath);
    file.data.astro.frontmatter.lastModified = result.mtime.toISOString();
    file.data.astro.frontmatter.birthtime = result.birthtime.toISOString();
  };
};

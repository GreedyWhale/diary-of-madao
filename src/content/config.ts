/*
 * @Description: https://docs.astro.build/zh-cn/tutorials/add-content-collections/
 * @Author: MADAO
 * @Date: 2024-02-05 15:39:08
 * @LastEditors: MADAO
 * @LastEditTime: 2024-02-05 17:51:17
 */
// 从 `astro:content` 导入辅助工具
import { z, defineCollection } from "astro:content";
// 为每一个集合定义一个 `type` 和 `schema`
const notesCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    publishedAt: z.date(),
    updatedAt: z.date(),
    description: z.string(),
    author: z.string(),
    tags: z.array(z.string()),
  }),
});

// 导出一个单独的 `collections` 对象来注册你的集合
export const collections = {
  notes: notesCollection,
};

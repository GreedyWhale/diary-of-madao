/*
 * @Description: PostController 类型声明
 * @Author: MADAO
 * @Date: 2021-12-13 18:02:09
 * @LastEditors: MADAO
 * @LastEditTime: 2022-02-25 11:21:42
 */
import type { Post } from '@prisma/client';

export type PostData = Pick<Post, 'title' | 'content' | 'introduction'>;
export type Labels = {
  name: string;
  id?: number;
  action: 'add' | 'delete' | 'unchanged';
}[];
export interface CreatePostParams extends PostData {
  labels: Labels;
}

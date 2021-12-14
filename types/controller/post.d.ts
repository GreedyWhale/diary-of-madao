/*
 * @Description: PostController 类型声明
 * @Author: MADAO
 * @Date: 2021-12-13 18:02:09
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-13 18:03:13
 */
import type { Post } from '@prisma/client';

export type PostData = Pick<Post, 'title' | 'content' | 'introduction'>;
export type RequestLabels = {
  name: string;
  id?: number;
  action: 'add' | 'delete' | 'unchanged';
}[];
export interface CreatePostParams extends PostData {
  labels: RequestLabels;
}

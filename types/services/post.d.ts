/*
 * @Description: 请求posts相关类型声明
 * @Author: MADAO
 * @Date: 2021-12-14 12:39:33
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-14 14:15:28
 */
import type { Post, Label } from '@prisma/client';
import type { API } from '~/types/API';

export interface GetPostsParams {
  pageSize: number;
  page: number;
  labelId?: number;
}

export type PostItem = Post & {
  author: {
    username: string;
  };
  labels: { label: Label }[];
}

export type GetPostsResponse = API.BaseListResult<PostItem>;

/*
 * @Description: 文章相关请求
 * @Author: MADAO
 * @Date: 2021-08-09 21:40:05
 * @LastEditors: MADAO
 * @LastEditTime: 2021-10-14 16:35:53
 */
import type { CreatePostParams } from '~/controller/post';
import type { Post, Label } from '@prisma/client';
import type { API } from '~/types/API';

import request from '~/utils/request';
import { apiPost } from './api';

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

export const createPost = (params: CreatePostParams) => request.post<PostItem>(apiPost, { postData: params });

export const getPosts = (params: GetPostsParams) => request.get<GetPostsResponse>(apiPost, { params });

export const getPostDetail = (id: string) => request.get<PostItem>(`${apiPost}/${id}`);

export const deletePost = (id: number) => request.delete(`${apiPost}/${id}`);

export const updatePost = (id: string, params: CreatePostParams) => request.put<PostItem>(`${apiPost}/${id}`, { postData: params });

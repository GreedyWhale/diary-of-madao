/*
 * @Description: 文章相关请求
 * @Author: MADAO
 * @Date: 2021-08-09 21:40:05
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-14 14:22:32
 */
import type { CreatePostParams } from '~/types/controller/post';
import type { API } from '~/types/API';
import type { PostItem, GetPostsParams, GetPostsResponse } from '~/types/services/post';

import request from '~/utils/request';
import { apiPost } from './api';

export const createPost = (params: CreatePostParams) => request.post<API.ResponseData<PostItem>>(apiPost, { postData: params });

export const getPosts = (params: GetPostsParams) => request.get<API.ResponseData<GetPostsResponse>>(apiPost, { params });

export const getPostDetail = (id: string) => request.get<API.ResponseData<PostItem>>(`${apiPost}/${id}`);

export const deletePost = (id: number) => request.delete(`${apiPost}/${id}`);

export const updatePost = (id: string, params: CreatePostParams) => request.put<API.ResponseData<PostItem>>(`${apiPost}/${id}`, { postData: params });

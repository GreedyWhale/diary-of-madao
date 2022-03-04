/*
 * @Description: PostPane组件类型声明
 * @Author: MADAO
 * @Date: 2021-12-16 16:56:05
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-16 16:56:05
 */
import type { GetPostsResponse } from '~/types/services/post';

export interface PostPaneProps {
  post: GetPostsResponse['list'][number];
}

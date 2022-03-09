/*
 * @Description: 请求label相关类型声明
 * @Author: MADAO
 * @Date: 2022-03-08 12:20:50
 * @LastEditors: MADAO
 * @LastEditTime: 2022-03-08 15:25:03
 */
import type { API } from '~/types/API';

export type LabelList = {
  id: number;
  name: string;
  posts: number[];
}[];

export type LabelListResponse = API.ResponseData<LabelList>;

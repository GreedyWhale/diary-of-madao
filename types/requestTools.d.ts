/*
 * @Description: 请求相关类型声明
 * @Author: MADAO
 * @Date: 2021-12-13 15:21:02
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-16 15:40:08
 */
import type { AxiosError } from 'axios';
import type { API } from '~/types/API';

export type ResponseStatusCode = 200
| 204
| 401
| 403
| 404
| 405
| 422
| 500;

export type ResponseMessageMap = {
  [key in ResponseStatusCode]: string;
}
export type FormatResponse = <T = Record<string, any> | null>(
  code: ResponseStatusCode,
  data?: T,
  message?: string
) => API.ResponseData<T>;

export type RequestError = AxiosError & {
  status: number;
  message: string;
};

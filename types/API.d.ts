/*
 * @Description: 接口相关类型声明
 * @Author: MADAO
 * @Date: 2021-09-23 16:57:42
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-27 17:14:59
 */
import type { AxiosError } from 'axios';

export module API {
  type BasePagination = Record<'pageSize' | 'currentPage' | 'total', number>;
  type ResponseStatusCode = 200
  | 204
  | 401
  | 403
  | 404
  | 405
  | 422
  | 500;
  interface BaseListResult<T> {
    list: T[];
    pagination: BasePagination;
  }
  interface ResponseData<T> {
    code: ResponseStatusCode;
    data: T;
    message: string;
  }

  type RequestError = AxiosError & {
    status: number;
    message: string;
  };
}

export type ResponseMessageMap = {
  [key in API.ResponseStatusCode]: string;
};

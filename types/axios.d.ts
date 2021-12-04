/*
 * @Description: axios 类型声明扩展
 * @Author: MADAO
 * @Date: 2021-07-24 10:49:52
 * @LastEditors: MADAO
 * @LastEditTime: 2021-09-14 12:18:51
 */

import type { ResponseJson } from '~/utils/request/tools';
declare module 'axios' {
  export interface AxiosRequestConfig {
    retry?: number;
    __retry?: number;
    retryDelay?: number;
    showErrorNotification?: boolean;
  }

  export interface AxiosInstance {
    get<T = any, R = ResponseJson<T>>(__url: string, _config?: AxiosRequestConfig): Promise<R>;
    delete<T = any, R = ResponseJson<T>>(_url: string, _config?: AxiosRequestConfig): Promise<R>;
    head<T = any, R = ResponseJson<T>>(_url: string, _config?: AxiosRequestConfig): Promise<R>;
    options<T = any, R = ResponseJson<T>>(_url: string, _config?: AxiosRequestConfig): Promise<R>;
    post<T = any, R = ResponseJson<T>>(_url: string, _data?: any, _config?: AxiosRequestConfig): Promise<R>;
    put<T = any, R = ResponseJson<T>>(_url: string, _data?: any, _config?: AxiosRequestConfig): Promise<R>;
    patch<T = any, R = ResponseJson<T>>(_url: string, _data?: any, _config?: AxiosRequestConfig): Promise<R>;
  }
}

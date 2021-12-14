/*
 * @Description: axios 类型声明扩展
 * @Author: MADAO
 * @Date: 2021-07-24 10:49:52
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-14 12:55:02
 */
declare module 'axios' {
  export interface AxiosRequestConfig {
    retry?: number;
    __retry?: number;
    retryDelay?: number;
    showErrorNotification?: boolean;
  }
}

export {};

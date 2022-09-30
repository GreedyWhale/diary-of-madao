/*
 * @Description: axios 类型声明扩展
 * @Author: MADAO
 * @Date: 2021-07-24 10:49:52
 * @LastEditors: MADAO
 * @LastEditTime: 2022-09-30 15:34:28
 */
declare module 'axios' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  export interface AxiosRequestConfig {
    retry?: number;
    __retry?: number;
    retryDelay?: number;
    showErrorNotification?: boolean;
  }
}

export {};

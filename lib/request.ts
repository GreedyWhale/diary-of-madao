/*
 * @Description: 请求方法
 * @Author: MADAO
 * @Date: 2022-09-30 15:29:54
 * @LastEditors: MADAO
 * @LastEditTime: 2022-11-01 15:43:36
 */
import type { Response } from '~/lib/api';
import type { AxiosError } from 'axios';

import axios from 'axios';

import { isBrowser } from '~/lib/env';
import showNotification from '~/components/Notification';

const axiosInstance = axios.create({
  baseURL: isBrowser ? '' : 'http://localhost:3000',
  retry: 0,
  retryDelay: 0,
  showErrorNotification: true,
});

axiosInstance.interceptors.response.use(response => response, async (error: AxiosError<Response<any>>) => {
  let result: Response<unknown> = {
    message: '',
    status: 0,
  };

  if (axios.isCancel(error)) {
    return Promise.reject(error);
  }

  if (error.config.retry) {
    error.config.__retry = error.config.__retry ?? 0;

    if (error.config.__retry < error.config.retry) {
      error.config.__retry += 1;

      const backOff = new Promise(resolve => {
        window.setTimeout(() => { resolve(true); }, error.config.retryDelay ?? 1000);
      });

      return backOff.then(async () => axiosInstance(error.config));
    }
  }

  if (error.response) { // 服务器响应码不在2xx范围
    result = {
      ...error.response.data,
      message: error.response.data.message || error.response.statusText,
    };
  } else if (error.request) { // 请求已发出，但没有回应
    result = {
      message: error.message || '请求失败',
      status: -1,
    };
  } else { // 代码出错
    result = {
      message: error.message || '请求出错',
      status: -2,
    };
  }

  if (error.config.showErrorNotification && isBrowser) {
    showNotification({
      content: result.message,
      theme: 'fail',
      delay: 0,
    });
  }

  return Promise.reject(result);
});

export default axiosInstance;

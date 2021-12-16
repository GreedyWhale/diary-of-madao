/*
 * @Description: 自定义请求方法
 * @Author: MADAO
 * @Date: 2021-07-24 10:45:07
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-16 15:33:18
 */
import type { AxiosError } from 'axios';

import axios from 'axios';

import showNotification from '~/components/Notification';
import { ENV_IS_BROWSER } from '~/utils/constants';

const axiosInstance = axios.create({
  baseURL: ENV_IS_BROWSER ? '' : 'http://localhost:3000',
  retry: 0,
  retryDelay: 0,
  showErrorNotification: true,
});

axiosInstance.interceptors.response.use(response => response, (error: AxiosError) => {
  const { config = {}, response } = error;
  const message = error.message || '请求失败';
  const errorData = response
    ? { ...response, message: response?.statusText || message }
    : { message, status: 502 };

  if (config.retry) {
    config.__retry = config.__retry || 0;

    if (config.__retry >= config.retry) {
      return Promise.reject(errorData);
    }

    config.__retry += 1;
    const backOff = new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, config.retryDelay || 1000);
    });

    backOff.then(() => {
      axiosInstance(config);
    });
  }

  if (config.showErrorNotification && ENV_IS_BROWSER) {
    showNotification({
      content: errorData.message,
      theme: 'fail',
      delay: 0,
    });
  }

  return Promise.reject(errorData);
});

export default axiosInstance;

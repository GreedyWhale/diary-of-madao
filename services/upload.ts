/*
 * @Description: 图片上传请求方法
 * @Author: MADAO
 * @Date: 2021-10-12 17:42:33
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-20 10:34:17
 */
import type { API } from '~/types/API';

import request from '~/utils/request';
import { apiImage } from './api';

export const uploadImage = (file: File) => {
  const data = new FormData();
  data.append('file', file);
  return request.post<API.ResponseData<{
    destination: string;
    encoding: string;
    fieldname: string;
    filename: string;
    mimetype: string;
    originalname: string;
    path: string;
    size: number;
  }>>(apiImage, data);
};

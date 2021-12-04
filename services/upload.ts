/*
 * @Description: 图片上传请求方法
 * @Author: MADAO
 * @Date: 2021-10-12 17:42:33
 * @LastEditors: MADAO
 * @LastEditTime: 2021-10-13 14:26:28
 */
import request from '~/utils/request';
import { apiImage } from './api';

export const uploadImage = (file: File) => {
  const data = new FormData();
  data.append('file', file);
  return request.post<{
    destination: string;
    encoding: string;
    fieldname: string;
    filename: string;
    mimetype: string;
    originalname: string;
    path: string;
    size: 1393992
  }>(apiImage, data);
};

/*
 * @Description: 上传文件 https://nextjs.org/docs/basic-features/static-file-serving
 * @Author: MADAO
 * @Date: 2022-10-22 11:03:40
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-22 15:43:55
 */
import type { FileInfo } from '~/pages/api/v1/upload';
import type { Response } from '~/lib/api';

import request from '~/lib/request';

import { apiUpload } from './api';

export const upload = async (file: File) => {
  const data = new FormData();
  data.append('file', file);

  return request.post<Response<FileInfo>>(apiUpload, data);
};

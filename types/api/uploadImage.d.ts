/*
 * @Description: 图片上传接口类型声明
 * @Author: MADAO
 * @Date: 2021-12-14 11:17:36
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-14 11:18:52
 */
import type { NextApiRequest } from 'next';

export type NextApiRequestWithFiles = NextApiRequest & {
  files: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
  }[];
};

/*
 * @Description: 上传接口
 * @Author: MADAO
 * @Date: 2022-10-22 15:49:00
 * @LastEditors: MADAO
 * @LastEditTime: 2022-11-03 14:19:19
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Response } from '~/lib/api';

import multer from 'multer';
import path from 'path';

import { formatResponse } from '~/lib/api';

export type FileInfo = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
};

type NextApiRequestWithFiles = NextApiRequest & {
  files: FileInfo[];
};

class UploadModel {
  uploader = multer({
    storage: multer.diskStorage({
      filename(req, file, cb) {
        const [filename, extname] = file.originalname.split('.');
        cb(null, `${filename}_${Date.now()}.${extname}`);
      },
      destination: path.join(process.cwd(), './public/upload'),
    }),
    limits: {
      fileSize: 10485760,
    },
  }).any();

  async doUpload(req: NextApiRequest, res: NextApiResponse) {
    return new Promise<Response<FileInfo>>(resolve => {
      // @ts-expect-error: 不知道如何定义
      this.uploader(req, res, error => {
        if (error) {
          resolve(formatResponse({ status: 500, message: (error as Error).message }));
          return;
        }

        resolve(formatResponse({ status: 200, message: '上传成功', resource: (req as unknown as NextApiRequestWithFiles).files[0] }));
      });
    });
  }
}

export default UploadModel;

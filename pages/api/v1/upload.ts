/*
 * @Description: 上传接口
 * @Author: MADAO
 * @Date: 2022-10-22 10:32:22
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-22 15:34:06
 */
import type { NextApiHandler } from 'next';
import type { Response } from '~/lib/api';

import multer from 'multer';
import path from 'path';

import { formatResponse } from '~/lib/api';
import { withSessionRoute } from '~/lib/withSession';
import { withMiddleware } from '~/lib/middleware';

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

const uploader = multer({
  storage: multer.diskStorage({
    filename(req, file, cb) {
      const [filename, extname] = file.originalname.split('.');
      console.log('filename', filename);
      cb(null, `${filename}_${Date.now()}.${extname}`);
    },
    destination: path.join(process.cwd(), './public/upload'),
  }),
  limits: {
    fileSize: 10485760,
  },
}).any();

const doUpload = async (req: any, res: any) => new Promise<Response>(resolve => {
  uploader(req, res, error => {
    if (error) {
      resolve(formatResponse({ status: 500, message: (error as Error).message }));
      return;
    }

    resolve(formatResponse({ status: 200, message: '上传成功', resource: (req.files as FileInfo[])[0] }));
  });
});

export default withSessionRoute(withMiddleware({
  async post(req, res) {
    const result = await doUpload(req, res);
    res.status(result.status).json(result);
  },
}));

export const config = {
  api: {
    bodyParser: false,
  },
};

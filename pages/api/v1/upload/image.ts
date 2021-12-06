/*
 * @Description: 图片相关接口
 * @Author: MADAO
 * @Date: 2021-10-11 16:19:59
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-06 11:28:13
 */
import type { NextApiHandler, NextApiRequest } from 'next';

import { withIronSession } from 'next-iron-session';
import multer from 'multer';
import path from 'path';

import { sessionOptions } from '~/utils/withSession';
import { ACCESS_IMAGE_UPLOAD } from '~/utils/constants';
import { responseData, runMiddleware, verifyPermission } from '~/utils/middlewares/index';
import { formatResponse } from '~/utils/request/tools';
import { promiseSettled } from '~/utils/promise';

type NextApiRequestWithFiles = NextApiRequest & {
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
}

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const [filename, extname] = file.originalname.split('.');
    cb(null, `${filename}_${Date.now()}.${extname}`);
  },
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), '/static/images/posts'));
  },
});

const uploader = multer({ storage });

const image:NextApiHandler = async (req, res) => {
  if (req.method === 'POST') {
    const validationError = (await promiseSettled(verifyPermission(req, ACCESS_IMAGE_UPLOAD)))[1];

    if (validationError) {
      return responseData(res, validationError);
    }

    const fileError = (await promiseSettled(runMiddleware(req, res, uploader.any())))[1];

    if (fileError) {
      responseData(res, formatResponse(500, fileError, fileError.message));
      return;
    }

    responseData(res, formatResponse(200, (req as NextApiRequestWithFiles).files[0], '上传成功'));
    return;
  }

  responseData(res, formatResponse(405), { Allow: 'POST' });
};

export const config = {
  api: {
    bodyParser: false,
  },
};
export default withIronSession(image, sessionOptions);

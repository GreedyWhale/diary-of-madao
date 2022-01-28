/*
 * @Description: 图片相关接口
 * @Author: MADAO
 * @Date: 2021-10-11 16:19:59
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-27 14:34:09
 */
import type { NextApiHandler } from 'next';
import type { NextApiRequestWithFiles } from '~/types/api/uploadImage';

import multer from 'multer';
import path from 'path';

import { ACCESS_IMAGE_UPLOAD, SESSION_USER_ID } from '~/utils/constants';
import { endRequest, runMiddleware, checkRequestMethods, formatResponse } from '~/utils/middlewares';
import { promiseWithError } from '~/utils/promise';
import { withSessionRoute } from '~/utils/withSession';
import UserController from '~/controller/user';

const userController = new UserController();

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
  await checkRequestMethods(req, res, ['POST']);

  if (req.method === 'POST') {
    const validationError = (await promiseWithError(userController.permissionValidator(req.session[SESSION_USER_ID], ACCESS_IMAGE_UPLOAD)))[1];

    if (validationError) {
      return endRequest(res, validationError);
    }

    const fileError = (await promiseWithError(runMiddleware(req, res, uploader.any())))[1];

    if (fileError) {
      endRequest(res, formatResponse(500, fileError, fileError.message));
      return;
    }

    endRequest(res, formatResponse(200, (req as NextApiRequestWithFiles).files[0], '上传成功'));
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};
export default withSessionRoute(image);

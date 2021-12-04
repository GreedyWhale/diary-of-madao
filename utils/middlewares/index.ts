/*
 * @Description: API 中间件
 * @Author: MADAO
 * @Date: 2021-07-27 11:42:23
 * @LastEditors: MADAO
 * @LastEditTime: 2021-10-14 16:09:55
 */
import type { ResponseJson } from '~/utils/request/tools';
import type { NextApiRequest, NextApiResponse } from 'next';

import { STORAGE_USER_ID } from '~/utils/constants';
import { formatResponse } from '~/utils/request/tools';
import { promiseSettled } from '~/utils/promise';
import userController from '~/controller/user';

export const setCookie = async (req: NextApiRequest, key: string, value: any) => {
  req.session.set(key, value);
  await req.session.save();
};

export const responseData = (res: NextApiResponse, response: ResponseJson, headers?: Record<string, string>) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (headers) {
    Object.entries(headers).forEach(item => {
      const [key, value] = item;
      res.setHeader(key, value);
    });
  }

  res.status(response.code);
  res.json(response);
};

export const runMiddleware = (req, res, middleware) => {
  return new Promise((resolve, reject) => {
    middleware(req, res, result => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
};

export const verifyPermission = async (req: NextApiRequest, permission: string) => {
  const id = req.session.get(STORAGE_USER_ID);

  if (!id) {
    return Promise.reject(formatResponse(401, null, '用户身份验证失败'));
  }

  const [user, userError] = await promiseSettled(userController.getUser({ id }));

  if (userError) {
    return Promise.reject(formatResponse(500, null, userError.message));
  }

  if (!user) {
    return Promise.reject(formatResponse(404, null, '用户不存在'));
  }

  const isPassed = user.access.some(value => value === permission);

  if (!isPassed) {
    return Promise.reject(formatResponse(403, null, '权限不足'));
  }

  return isPassed;
};

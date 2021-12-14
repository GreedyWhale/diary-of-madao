/*
 * @Description: API 中间件
 * @Author: MADAO
 * @Date: 2021-12-13 14:58:11
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-14 11:15:43
 */
import type {
  RunMiddleware,
  CheckRequestMethods,
  EndRequest,
  SetCookie,
} from '~/types/middlewares';

import { formatResponse } from '~/utils/request/tools';

/**
 * @see https://nextjs.org/docs/api-routes/api-middlewares
 */
export const runMiddleware: RunMiddleware = (req, res, middleware) => new Promise((resolve, reject) => {
  middleware(req, res, (result: any) => {
    if (result instanceof Error) {
      return reject(result);
    }

    return resolve(result);
  });
});

export const checkRequestMethods: CheckRequestMethods = (req, res, allowedMethods) => {
  if (allowedMethods.includes(req.method || '')) {
    return Promise.resolve(true);
  }

  const data = formatResponse(405);
  endRequest(res, data, { Allow: allowedMethods.join(',') });
  return Promise.reject(new Error('请求方法不允许'));
};

export const endRequest: EndRequest = (res, data, headers?) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (headers) {
    Object.entries(headers).forEach(item => {
      const [key, value] = item;
      res.setHeader(key, value);
    });
  }

  res.status(data.code);
  res.json(data);
};

export const setCookie: SetCookie = async (req, key: string, value: any) => {
  req.session.set(key, value);
  await req.session.save();
};

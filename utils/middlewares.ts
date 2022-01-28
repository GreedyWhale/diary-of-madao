/*
 * @Description: API 中间件
 * @Author: MADAO
 * @Date: 2021-12-13 14:58:11
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-27 17:15:18
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import type {
  API,
  ResponseMessageMap,
} from '~/types/API';

/**
 * @see https://nextjs.org/docs/api-routes/api-middlewares
 */
export const runMiddleware = (req: NextApiRequest, res: NextApiResponse, middleware: (..._rest: any[]) => any) => new Promise((resolve, reject) => {
  middleware(req, res, (result: any) => {
    if (result instanceof Error) {
      return reject(result);
    }

    return resolve(result);
  });
});

export const checkRequestMethods = (req: NextApiRequest, res: NextApiResponse, allowedMethods: string[]) => {
  if (allowedMethods.includes(req.method || '')) {
    return Promise.resolve(true);
  }

  const data = formatResponse(405, {});
  endRequest(res, data, { Allow: allowedMethods.join(',') });
  return Promise.reject(new Error('请求方法不允许'));
};

export const endRequest = <T>(res: NextApiResponse, data: API.ResponseData<T>, headers?: Record<string, string>) => {
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

export const setCookie = async (req: NextApiRequest, key: string, value: any) => {
  req.session[key] = value;
  await req.session.save();
};

const messages: ResponseMessageMap = {
  200: '请求成功',
  204: 'No Content',
  401: '用户认证失败',
  403: '权限不足',
  404: '未找到相关资源',
  405: '请求方法不允许',
  422: '请求参数，请检查后重试',
  500: '服务器出错',
};

export const formatResponse = <T>(code: API.ResponseStatusCode, data: T, message?: string) => ({
  code,
  data,
  message: message || messages[code],
});

export const getErrorInfo = (error: API.RequestError | null) => {
  if (error) {
    return {
      errorCode: error.response ? error.response.status : error.status,
      errorMessage: error.response ? error.response.statusText : error.message,
    };
  }

  return null;
};


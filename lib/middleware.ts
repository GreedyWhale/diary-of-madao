/*
 * @Description:
 * 由于Next.js 12.3.1的middleware功能有bug，详情：https://github.com/vercel/next.js/issues/39262
 * 导致无法在使用middleware的时候上传文件，所以自己封装一个简易的middleware功能
 * 不选用next-connect的原因是next-connect正在进行重写，v1版本和v0版本不兼容，
 * 比较担心v1版本稳定后，放弃维护v0版本。
 * @Author: MADAO
 * @Date: 2022-10-22 14:21:44
 * @LastEditors: MADAO
 * @LastEditTime: 2022-12-06 14:47:00
 */
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { formatResponse } from '~/lib/api';

type HandlerType = Partial<Record<'get' | 'post' | 'put' | 'patch' | 'delete', NextApiHandler>>;
type MiddlewareType = (req: NextApiRequest, res: NextApiResponse, ...args: any[]) => Promise<any>;

export const withMiddleware = (handler: HandlerType): NextApiHandler => async (req, res) => {
  const method = (req.method ?? '').toLowerCase() as keyof HandlerType;

  try {
    await noMatchMiddleware(req, res, Object.keys(handler));
    await authMiddleware(req, res);
    await handler[method]!(req, res);
  } catch (error) {
    res.json(error);
  }
};

export const noMatchMiddleware: MiddlewareType = async (req, res, allowedMethods: string[]) => {
  const currentMethod = (req.method ?? '').toLowerCase();
  if (allowedMethods.includes(currentMethod)) {
    return true;
  }

  res.setHeader('Allow', allowedMethods.map(value => value.toLocaleUpperCase()).join(','));
  res.status(405);
  return Promise.reject(formatResponse({ status: 405 }));
};

export const authMiddleware: MiddlewareType = async (req, res) => {
  const { user } = req.session;
  const url = req.url ?? '';
  const method = req.method ?? '';

  switch (true) {
    case url.endsWith('/session'):
    case url.includes('/note') && method === 'GET':
    case url.endsWith('/label') && method === 'GET':
      return true;
    default:
      if (!user) {
        res.status(401);
        return Promise.reject(formatResponse({ status: 401, message: 'Unauthorized' }));
      }

      break;
  }
};

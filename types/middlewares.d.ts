/*
 * @Description: middlewares.ts 类型声明
 * @Author: MADAO
 * @Date: 2021-12-13 14:58:51
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-14 11:14:34
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import type { ResponseJson } from '~/utils/request/tools';

export type RunMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  middleware: (...rest: any[]) => any
) => Promise<unknown>;

export type CheckRequestMethods = (
  req: NextApiRequest,
  res: NextApiResponse,
  allowedMethods: string[]
) => Promise<boolean>;

export type EndRequest = (
  res: NextApiResponse,
  data: ResponseJson,
  headers?: Record<string, string>
) => void;

export type SetCookie = (
  req: NextApiRequest,
  key: string,
  value: string | number,
) => Promise<void>;

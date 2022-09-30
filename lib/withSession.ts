/*
 * @Description: https://github.com/vvo/iron-session
 * @Author: MADAO
 * @Date: 2022-09-30 10:43:38
 * @LastEditors: MADAO
 * @LastEditTime: 2022-09-30 11:10:39
 */
import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next';
import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
} from 'next';

import { sessionOptions } from './sessionConfig';

export function withSessionRoute(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, sessionOptions);
}

export function withSessionSsr<
  P extends Record<string, unknown> = Record<string, unknown>,
>(
  handler: (
    context: GetServerSidePropsContext,
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
) {
  return withIronSessionSsr(handler, sessionOptions);
}

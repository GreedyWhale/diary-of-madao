/*
 * @Description: 添加cookie至next.js的api
 * @Author: MADAO
 * @Date: 2021-07-28 14:16:20
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-14 12:11:34
 */
import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
  NextApiRequest,
} from 'next';

import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next';

import { SESSION_USER_ID } from '~/utils/constants';

export const sessionOptions = {
  cookieName: 'diary-of-madao',
  password: process.env.COOKIE_PASSWORD as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export const getUserIdFromCookie = (req: NextApiRequest) => {
  const userId: number = req.session[SESSION_USER_ID] || -1;
  return userId;
};

export function withSessionRoute(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, sessionOptions);
}

export function withSessionSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown },
>(
  handler: (
    _context: GetServerSidePropsContext,
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
) {
  return withIronSessionSsr(handler, sessionOptions);
}

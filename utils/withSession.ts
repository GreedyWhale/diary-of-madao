/*
 * @Description: 添加cookie至next.js的api
 * @Author: MADAO
 * @Date: 2021-07-28 14:16:20
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-13 16:21:23
 */
import type { WithSessionRoute, WithSessionSsr } from '~/types/withSession';

import { NextApiRequest } from 'next';
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
  const userId = req.session[SESSION_USER_ID] || -1;
  return userId;
};

export const withSessionRoute: WithSessionRoute = handler => withIronSessionApiRoute(handler, sessionOptions);
export const withSessionSsr: WithSessionSsr = handler => withIronSessionSsr(handler, sessionOptions);

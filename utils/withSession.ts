/*
 * @Description: 添加cookie至next.js的api
 * @Author: MADAO
 * @Date: 2021-07-28 14:16:20
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-02 15:15:55
 */
import type { GetServerSidePropsContext, GetServerSideProps } from 'next';

import { NextApiRequest } from 'next';
import { applySession } from 'next-iron-session';
import { merge } from 'lodash';

import { STORAGE_USER_ID } from '~/utils/constants';

export type WithSessionResult<T> = { userId: number } & T;

export const sessionOptions = {
  cookieName: 'diary-of-madao',
  password: process.env.COOKIE_PASSWORD,
  cookieOptions: {
    // process.env.NODE_ENV === 'production'
    secure: false
  }
};

export const getUserIdFromCookie = (req: NextApiRequest) => {
  const userId = req.session.get<number>(STORAGE_USER_ID) || -1;

  return userId;
};

export const withSession = (handler?: GetServerSideProps) => {
  return async (context: GetServerSidePropsContext) => {
    let userId = -1;
    try {
      await applySession(context.req, context.res, sessionOptions);
      userId = getUserIdFromCookie(context.req as NextApiRequest);
    } catch (error) {
      console.error(error);
    }

    const serverProps = {
      props: { userId }
    };

    if (handler) {
      const extraProps = await handler(context);
      return merge(serverProps, extraProps);
    }

    return serverProps;
  };
};

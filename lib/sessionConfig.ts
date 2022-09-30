/*
 * @Description: https://github.com/vvo/iron-session/issues/537
 * @Author: MADAO
 * @Date: 2022-09-30 11:04:38
 * @LastEditors: MADAO
 * @LastEditTime: 2022-09-30 11:09:59
 */

import type { IronSessionOptions } from 'iron-session';

export const sessionOptions: IronSessionOptions = {
  password: process.env.COOKIE_KEY!,
  cookieName: 'diary_of_madao_cookie',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

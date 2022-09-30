/*
 * @Description: https://github.com/vvo/iron-session
 * @Author: MADAO
 * @Date: 2022-09-30 11:14:06
 * @LastEditors: MADAO
 * @LastEditTime: 2022-09-30 15:00:35
 */
declare module 'iron-session' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface IronSessionData {
    user?: {
      id: number;
    };
  }
}

export {};

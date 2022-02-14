/*
 * @Description: 扩充next request api声明
 * @Author: MADAO
 * @Date: 2021-07-28 14:27:17
 * @LastEditors: MADAO
 * @LastEditTime: 2022-02-14 22:22:52
 */
declare module 'iron-session' {
  interface IronSessionData {
    SESSION_USER_ID?: number;
  }
}

export {};

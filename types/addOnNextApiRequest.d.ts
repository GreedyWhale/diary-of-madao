/*
 * @Description: 扩充next request api声明
 * @Author: MADAO
 * @Date: 2021-07-28 14:27:17
 * @LastEditors: MADAO
 * @LastEditTime: 2021-07-28 14:28:01
 */
import { Session } from 'next-iron-session';

declare module 'next' {
  export interface NextApiRequest {
    session: Session
  }
}

/*
 * @Description: NextApiRequest 增强版
 * @Author: MADAO
 * @Date: 2021-03-16 15:27:09
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-16 15:33:06
 */
import { Session } from 'next-iron-session';

declare module 'next' {
  export interface NextApiRequest {
    session: Session
  }
}

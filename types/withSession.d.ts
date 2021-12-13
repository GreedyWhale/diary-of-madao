/*
 * @Description: withSession 相关类型声明
 * @Author: MADAO
 * @Date: 2021-12-13 16:05:50
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-13 16:14:44
 */
import type { NextApiHandler } from 'next';
import type { withIronSessionSsr } from 'iron-session/next';

export type WithSessionRoute = (handler: NextApiHandler) => NextApiHandler<any>;
export type WithSessionSsr = <P extends { [key: string]: unknown } = { [key: string]: unknown }>(
  handler: (context: GetServerSidePropsContext) => GetServerSidePropsResult<T> | Promise<GetServerSidePropsResult<T>>,
) => withIronSessionSsr<T>;

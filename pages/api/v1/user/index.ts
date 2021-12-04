/*
 * @Description: 用户登录、注册、退出
 * @Author: MADAO
 * @Date: 2021-07-28 09:57:52
 * @LastEditors: MADAO
 * @LastEditTime: 2021-10-11 17:02:10
 */
import type { NextApiHandler } from 'next';

import { withIronSession } from 'next-iron-session';

import { responseData, setCookie } from '~/utils/middlewares/index';
import userController from '~/controller/user';
import { STORAGE_USER_ID } from '~/utils/constants';
import { sessionOptions } from '~/utils/withSession';
import { formatResponse } from '~/utils/request/tools';
import { promiseSettled } from '~/utils/promise';

const user: NextApiHandler = async (req, res) => {
  const { username, password } = req.body;

  if (req.method === 'DELETE') {
    req.session.destroy();
    responseData(res, formatResponse(204, null, '退出成功'));
    return;
  }

  if (req.method === 'GET') {
    const id = req.session.get(STORAGE_USER_ID);
    if (!id) {
      req.session.destroy();
      responseData(res, formatResponse(401, null, '用户身份验证失败'));
      return;
    }

    const [user, sigInError] = await promiseSettled(userController.signIn({ id }));
    if (sigInError) {
      req.session.destroy();
      responseData(res, sigInError);
      return;
    }

    await setCookie(req, STORAGE_USER_ID, user.data.id);
    responseData(res, user);
    return;
  }

  if (req.method === 'POST') {
    const [user, signUpError] = await promiseSettled(userController.signUp(username, password));
    if (signUpError) {
      req.session.destroy();
      responseData(res, signUpError);
      return;
    }

    await setCookie(req, STORAGE_USER_ID, user.data.id);
    responseData(res, user);
    return;
  }

  responseData(res, formatResponse(405), { Allow: 'GET, DELETE, GET' });
};

export default withIronSession(user, sessionOptions);

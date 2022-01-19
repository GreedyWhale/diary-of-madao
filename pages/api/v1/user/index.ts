/*
 * @Description: 用户登录、注册、退出
 * @Author: MADAO
 * @Date: 2021-07-28 09:57:52
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-19 17:29:36
 */
import type { NextApiHandler } from 'next';

import { endRequest, setCookie, checkRequestMethods } from '~/utils/middlewares';
import UserController from '~/controller/user';
import { SESSION_USER_ID } from '~/utils/constants';
import { formatResponse } from '~/utils/request/tools';
import { promiseWithError } from '~/utils/promise';
import { withSessionRoute } from '~/utils/withSession';

const userController = new UserController();
const user: NextApiHandler = async (req, res) => {
  await checkRequestMethods(req, res, ['DELETE', 'GET', 'POST']);

  const { username, password } = req.body;
  if (req.method === 'DELETE') {
    req.session.destroy();
    endRequest(res, formatResponse(204, null, '退出成功'));
    return;
  }

  if (req.method === 'GET') {
    const id = req.session[SESSION_USER_ID];
    if (!id) {
      req.session.destroy();
      endRequest(res, formatResponse(401, null, '用户身份验证失败'));
      return;
    }

    const [user, error] = await promiseWithError(userController.signIn({ id }));
    if (error) {
      req.session.destroy();
      endRequest(res, error);
      return;
    }

    await setCookie(req, SESSION_USER_ID, user!.data.id);
    endRequest(res, user!);
    return;
  }

  if (req.method === 'POST') {
    const [user, error] = await promiseWithError(userController.signUp(username, password));
    if (error) {
      req.session.destroy();
      endRequest(res, error);
      return;
    }

    await setCookie(req, SESSION_USER_ID, user!.data.id);
    endRequest(res, user);
  }
};

export default withSessionRoute(user);

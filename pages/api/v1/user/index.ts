/*
 * @Description: 用户登录、注册、退出
 * @Author: MADAO
 * @Date: 2021-07-28 09:57:52
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-28 12:51:47
 */
import type { NextApiHandler } from 'next';
import type { API } from '~/types/API';
import type { User } from '@prisma/client';

import { endRequest, setCookie, checkRequestMethods, formatResponse } from '~/utils/middlewares';
import UserController from '~/controller/user';
import { SESSION_USER_ID } from '~/utils/constants';
import { withSessionRoute } from '~/utils/withSession';

const userController = new UserController();
const user: NextApiHandler = async (req, res) => {
  await checkRequestMethods(req, res, ['DELETE', 'GET', 'POST']);

  const { username, password } = req.body;
  if (req.method === 'DELETE') {
    req.session.destroy();
    endRequest(res, formatResponse(204, {}, '退出成功'));
    return;
  }

  if (req.method === 'GET') {
    const id = req.session[SESSION_USER_ID];
    const { username, password } = req.query;
    let user: API.ResponseData<User> | null = null;

    if (username && password) {
      user = await userController.signIn({ username: username as string }, password as string);
    } else if (id) {
      user = await userController.signIn({ id });
    }

    if (user) {
      if (user.code === 200) {
        await setCookie(req, SESSION_USER_ID, user.data.id);
      } else {
        req.session.destroy();
      }

      endRequest(res, user);
      return;
    }

    req.session.destroy();
    endRequest(res, formatResponse(401, {}, '用户身份验证失败'));
    return;
  }

  if (req.method === 'POST') {
    const user = await userController.signUp(username, password);
    if (user.code === 200) {
      await setCookie(req, SESSION_USER_ID, user.data.id);
    } else {
      req.session.destroy();
    }

    endRequest(res, user);
  }
};

export default withSessionRoute(user);

/*
 * @Description: 用户登录、注册、退出
 * @Author: MADAO
 * @Date: 2021-07-28 09:57:52
 * @LastEditors: MADAO
 * @LastEditTime: 2022-02-23 19:04:48
 */
import type { NextApiHandler } from 'next';
import type { API } from '~/types/API';
import type { UserResponse } from '~/types/services/user';

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
    let userResponse: API.ResponseData<UserResponse> | null = null;

    if (username && password) {
      userResponse = await userController.signIn({ username: username as string }, password as string);
    } else if (id) {
      userResponse = await userController.signIn({ id });
    }

    if (!userResponse || userResponse.code === 404) {
      userResponse = await userController.signUp(username as string, password as string);
    }

    if (userResponse) {
      await setCookie(req, userResponse!.data.id);
      endRequest(res, userResponse!);
      return;
    }

    req.session.destroy();
    endRequest(res, formatResponse(401, {}, '用户身份验证失败'));
    return;
  }

  if (req.method === 'POST') {
    const user = await userController.signUp(username, password);
    endRequest(res, user);
  }
};

export default withSessionRoute(user);

/*
 * @Description: 将static文件夹的改动同步至github
 * @Author: MADAO
 * @Date: 2021-10-14 14:36:15
 * @LastEditors: MADAO
 * @LastEditTime: 2022-04-28 14:17:57
 */
import type { NextApiHandler } from 'next';
import type { SimpleGit } from 'simple-git';

import simpleGit from 'simple-git';
import path from 'path';

import { endRequest, checkRequestMethods, formatResponse } from '~/utils/middlewares';
import { ACCESS_GIT_SYNC, SESSION_USER_ID } from '~/utils/constants';
import { promiseWithError } from '~/utils/promise';
import UserController from '~/controller/user';
import { withSessionRoute } from '~/utils/withSession';

const git: SimpleGit = simpleGit();
const userController = new UserController();
const gitActions: NextApiHandler = async (req, res) => {
  await checkRequestMethods(req, res, ['PUT']);
  if (req.method === 'PUT') {
    const user = await userController.getUser({ id: req.session[SESSION_USER_ID] });
    if (user.status === 'rejected') {
      endRequest(res, formatResponse(500, user.reason, user.reason.message));
      return;
    }

    if (!user.value) {
      endRequest(res, formatResponse(404, {}, '用户不存在'));
      return;
    }

    const verifiedResult = await userController.validator('access', {
      currentAccess: ACCESS_GIT_SYNC,
      userId: user.value.id,
    });

    if (!verifiedResult.passed) {
      endRequest(res, formatResponse(403, {}, verifiedResult.message));
      return;
    }

    const [syncResult, syncError] = await promiseWithError(
      git
        .add(path.join(process.cwd(), '/static'))
        .commit('update：更新static目录')
        .pull('origin', 'main')
        .push(['origin', 'main'], () => console.log('sync done')),
    );

    if (syncError) {
      endRequest(res, formatResponse(500, {}, syncError.message));
      return;
    }

    endRequest(res, formatResponse(200, syncResult, '同步成功'));
  }
};

export default withSessionRoute(gitActions);

/*
 * @Description: 将static文件夹的改动同步至github
 * @Author: MADAO
 * @Date: 2021-10-14 14:36:15
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-14 11:22:14
 */
import type { NextApiHandler } from 'next';
import type { SimpleGit } from 'simple-git';

import simpleGit from 'simple-git';
import path from 'path';

import { formatResponse } from '~/utils/request/tools';
import { endRequest, checkRequestMethods } from '~/utils/middlewares';
import { ACCESS_GIT_SYNC, SESSION_USER_ID } from '~/utils/constants';
import { promiseWithError } from '~/utils/promise';
import UserController from '~/controller/user';
import { withSessionRoute } from '~/utils/withSession';

const git: SimpleGit = simpleGit();
const userController = new UserController();
const gitActions: NextApiHandler = async (req, res) => {
  await checkRequestMethods(req, res, ['POSt']);
  if (req.method === 'POST') {
    const validationError = (await promiseWithError(userController.permissionValidator(req.session[SESSION_USER_ID], ACCESS_GIT_SYNC)))[1];

    if (validationError) {
      endRequest(res, validationError);
      return;
    }

    const [syncResult, syncError] = await promiseWithError(
      git
        .add(path.join(process.cwd(), '/static'))
        .commit('update：更新static目录')
        .push(['origin', 'main'], () => console.log('sync done')),
    );

    if (syncError) {
      endRequest(res, formatResponse(500, null, syncError.message));
      return;
    }

    endRequest(res, formatResponse(200, syncResult, '同步成功'));
  }
};

export default withSessionRoute(gitActions);

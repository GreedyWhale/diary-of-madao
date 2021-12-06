/*
 * @Description: 将static文件夹的改动同步至github
 * @Author: MADAO
 * @Date: 2021-10-14 14:36:15
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-06 11:26:37
 */
import type { NextApiHandler } from 'next';
import type { SimpleGit } from 'simple-git';

import simpleGit from 'simple-git';
import path from 'path';
import { withIronSession } from 'next-iron-session';

import { formatResponse } from '~/utils/request/tools';
import { responseData } from '~/utils/middlewares/index';
import { ACCESS_GIT_SYNC } from '~/utils/constants';
import { verifyPermission } from '~/utils/middlewares';
import { promiseSettled } from '~/utils/promise';
import { sessionOptions } from '~/utils/withSession';

const git: SimpleGit = simpleGit();

const gitActions: NextApiHandler = async (req, res) => {
  if (req.method === 'POST') {
    const validationError = (await promiseSettled(verifyPermission(req, ACCESS_GIT_SYNC)))[1];

    if (validationError) {
      responseData(res, validationError);
      return;
    }

    const [syncResult, syncError] = await promiseSettled(
      git
        .add(path.join(process.cwd(), '/static'))
        .commit('update：更新static目录')
        .push(['origin', 'main'], () => console.log('sync done')),
    );

    if (syncError) {
      responseData(res, formatResponse(500, null, syncError.message));
      return;
    }

    return responseData(res, formatResponse(200, syncResult, '同步成功'));
  }

  responseData(res, formatResponse(405), { Allow: 'POST' });
};

export default withIronSession(gitActions, sessionOptions);

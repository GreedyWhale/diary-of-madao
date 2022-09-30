/*
 * @Description: 用户信息接口
 * @Author: MADAO
 * @Date: 2022-09-30 10:06:56
 * @LastEditors: MADAO
 * @LastEditTime: 2022-09-30 17:57:37
 */
import type { NextApiHandler } from 'next';

import UserModel from '~/model/user';
import { formatResponse } from '~/lib/request';
import { withSessionRoute } from '~/lib/withSession';

const handler: NextApiHandler = async (req, res) => {
  const user = new UserModel(req.body.username, req.body.password);

  if (req.method === 'GET') {
    const result = await user.index(req.session.user?.id);
    res.status(result.status).json(result);
    return;
  }

  res.setHeader('Allow', 'GET');
  res.status(405).json(formatResponse({ status: 405 }));
};

export default withSessionRoute(handler);

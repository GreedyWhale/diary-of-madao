/*
 * @Description: 登录接口
 * @Author: MADAO
 * @Date: 2022-09-30 10:06:56
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-22 15:22:38
 */
import type { NextApiHandler } from 'next';

import UserModel from '~/model/user';
import { formatResponse } from '~/lib/api';
import { withSessionRoute } from '~/lib/withSession';
import { withMiddleware } from '~/lib/middleware';

const handler: NextApiHandler = async (req, res) => {
  const user = new UserModel(req.body.username, req.body.password);

  if (req.method === 'POST') {
    const result = await user.create();
    if (result.resource) {
      req.session.user = {
        id: result.resource.id,
      };
      await req.session.save();
    }

    res.status(result.status).json(result);
    return;
  }

  res.setHeader('Allow', 'POST');
  res.status(405).json(formatResponse({ status: 405 }));
};

export default withSessionRoute(withMiddleware({
  async post(req, res) {
    const user = new UserModel(req.body.username, req.body.password);
    const result = await user.create();
    if (result.resource) {
      req.session.user = {
        id: result.resource.id,
      };
      await req.session.save();
    }

    res.status(result.status).json(result);
  },
}));

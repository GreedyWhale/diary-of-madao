/*
 * @Description: 登录接口
 * @Author: MADAO
 * @Date: 2022-09-30 10:06:56
 * @LastEditors: MADAO
 * @LastEditTime: 2022-11-01 20:40:06
 */
import LabelModel from '~/model/label';
import { withSessionRoute } from '~/lib/withSession';
import { withMiddleware } from '~/lib/middleware';

export default withSessionRoute(withMiddleware({
  async post(req, res) {
    const label = new LabelModel();
    const result = await label.create({
      ...req.body,
      userId: req.session.user?.id,
    });
    res.status(result.status).json(result);
  },

  async get(req, res) {
    const label = new LabelModel();
    const result = await label.index();
    res.status(result.status).json(result);
  },
}));

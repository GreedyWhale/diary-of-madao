/*
 * @Description: 用户信息接口
 * @Author: MADAO
 * @Date: 2022-09-30 10:06:56
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-31 17:14:36
 */
import UserModel from '~/model/user';
import { withSessionRoute } from '~/lib/withSession';
import { withMiddleware } from '~/lib/middleware';

export default withSessionRoute(withMiddleware({
  async get(req, res) {
    const user = new UserModel();
    const result = await user.index({ id: req.session.user?.id });
    res.status(result.status).json(result);
  },
}));

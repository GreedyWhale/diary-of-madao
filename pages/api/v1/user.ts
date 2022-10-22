/*
 * @Description: 用户信息接口
 * @Author: MADAO
 * @Date: 2022-09-30 10:06:56
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-22 15:31:53
 */
import UserModel from '~/model/user';
import { withSessionRoute } from '~/lib/withSession';
import { withMiddleware } from '~/lib/middleware';

export default withSessionRoute(withMiddleware({
  async get(req, res) {
    const user = new UserModel(req.body.username, req.body.password);
    const result = await user.index(req.session.user?.id);
    res.status(result.status).json(result);
  },
}));

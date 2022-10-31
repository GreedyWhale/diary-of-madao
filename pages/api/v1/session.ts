/*
 * @Description: 登录接口
 * @Author: MADAO
 * @Date: 2022-09-30 10:06:56
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-31 11:36:21
 */
import UserModel from '~/model/user';
import { withSessionRoute } from '~/lib/withSession';
import { withMiddleware } from '~/lib/middleware';

export default withSessionRoute(withMiddleware({
  async post(req, res) {
    const user = new UserModel();
    const result = await user.create(req.body.username, req.body.password);
    if (result.resource) {
      req.session.user = {
        id: result.resource.id,
      };
      await req.session.save();
    }

    res.status(result.status).json(result);
  },
}));

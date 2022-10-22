/*
 * @Description: 登录接口
 * @Author: MADAO
 * @Date: 2022-09-30 10:06:56
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-22 16:15:18
 */
import UserModel from '~/model/user';
import { withSessionRoute } from '~/lib/withSession';
import { withMiddleware } from '~/lib/middleware';

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

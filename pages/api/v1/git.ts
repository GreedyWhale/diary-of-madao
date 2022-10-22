/*
 * @Description: 同步至github接口
 * @Author: MADAO
 * @Date: 2022-10-22 16:01:05
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-22 16:17:01
 */
import { withMiddleware } from '~/lib/middleware';
import { withSessionRoute } from '~/lib/withSession';
import GitModel from '~/model/git';

const git = new GitModel();

export default withSessionRoute(withMiddleware({
  async put(req, res) {
    const result = await git.syncToGitHub();
    res.status(result.status).json(result);
  },
}));

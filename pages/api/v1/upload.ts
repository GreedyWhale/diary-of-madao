/*
 * @Description: 上传接口
 * @Author: MADAO
 * @Date: 2022-10-22 10:32:22
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-22 16:00:18
 */
import { withSessionRoute } from '~/lib/withSession';
import { withMiddleware } from '~/lib/middleware';
import UploadModel from '~/model/upload';

const upload = new UploadModel();

export default withSessionRoute(withMiddleware({
  async post(req, res) {
    const result = await upload.doUpload(req, res);
    res.status(result.status).json(result);
  },
}));

export const config = {
  api: {
    bodyParser: false,
  },
};

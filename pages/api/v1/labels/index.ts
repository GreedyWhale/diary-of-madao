/*
 * @Description: 文章标签请求处理
 * @Author: MADAO
 * @Date: 2022-03-08 11:58:34
 * @LastEditors: MADAO
 * @LastEditTime: 2022-03-08 12:14:11
 */
import type { NextApiHandler } from 'next';

import { checkRequestMethods, endRequest } from '~/utils/middlewares';
import LabelController from '~/controller/label';

const labelController = new LabelController();
const LabelsHandler: NextApiHandler = async (req, res) => {
  await checkRequestMethods(req, res, ['GET']);

  if (req.method === 'GET') {
    const labels = await labelController.getLabels();
    endRequest(res, labels);
  }
};

export default LabelsHandler;

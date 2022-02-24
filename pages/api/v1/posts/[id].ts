/*
 * @Description: 博客详情接口
 * @Author: MADAO
 * @Date: 2021-09-24 17:48:28
 * @LastEditors: MADAO
 * @LastEditTime: 2022-02-24 16:23:53
 */
import type { NextApiHandler } from 'next';

import PostController from '~/controller/post';
import { endRequest, checkRequestMethods, formatResponse } from '~/utils/middlewares';
import { SESSION_USER_ID } from '~/utils/constants';
import { withSessionRoute } from '~/utils/withSession';

const postController = new PostController();

const postDetailHandler:NextApiHandler = async (req, res) => {
  await checkRequestMethods(req, res, ['GET', 'DELETE', 'PUT']);
  const { id } = req.query;
  const { postData } = req.body;
  const userId = req.session[SESSION_USER_ID];

  if (req.method === 'GET') {
    const detail = await postController.getDetail(parseInt(id as string, 10));
    endRequest(res, detail);
    return;
  }

  if (typeof userId !== 'number') {
    endRequest(res, formatResponse(500, {}, '请先登录'));
    return;
  }

  if (req.method === 'DELETE') {
    const result = await postController.deletePost(userId, parseInt(id as string, 10));
    endRequest(res, result);
    return;
  }

  if (req.method === 'PUT') {
    const result = await postController.updatePost(userId, postData, parseInt(id as string, 10));
    endRequest(res, result);
  }
};

export default withSessionRoute(postDetailHandler);

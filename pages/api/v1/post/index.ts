/*
 * @Description: 发布文章 & 文章列表
 * @Author: MADAO
 * @Date: 2021-08-07 14:11:15
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-13 17:52:11
 */
import type { NextApiHandler } from 'next';

import { endRequest, checkRequestMethods } from '~/utils/middlewares';
import { SESSION_USER_ID } from '~/utils/constants';
import PostController from '~/controller/post';
import { formatResponse } from '~/utils/request/tools';
import { withSessionRoute } from '~/utils/withSession';

const postController = new PostController();

const post: NextApiHandler = async (req, res) => {
  await checkRequestMethods(req, res, ['POST', 'GET']);

  const { postData } = req.body;
  const userId = req.session[SESSION_USER_ID];

  if (req.method === 'POST') {
    if (!userId) {
      return endRequest(res, formatResponse(422, null, '用户不存在'));
    }

    const post = await postController.updatePost(userId, postData);
    endRequest(res, post);
    return;
  }

  if (req.method === 'GET') {
    const posts = await postController.getPosts({
      pageSize: parseInt(req.query.pageSize as string, 10),
      page: parseInt(req.query.page as string, 10),
      labelId: req.query.labelId ? parseInt(req.query.labelId as string, 10) : undefined,
    });

    endRequest(res, posts);
  }
};

export default withSessionRoute(post);

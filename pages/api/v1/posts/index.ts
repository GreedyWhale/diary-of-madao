/*
 * @Description: 发布文章 & 文章列表
 * @Author: MADAO
 * @Date: 2021-08-07 14:11:15
 * @LastEditors: MADAO
 * @LastEditTime: 2022-02-24 15:38:32
 */
import type { NextApiHandler } from 'next';

import { endRequest, checkRequestMethods, formatResponse } from '~/utils/middlewares';
import { SESSION_USER_ID } from '~/utils/constants';
import PostController from '~/controller/post';
import { withSessionRoute } from '~/utils/withSession';

const postController = new PostController();

const postsHandler: NextApiHandler = async (req, res) => {
  await checkRequestMethods(req, res, ['POST', 'GET']);

  const { postData } = req.body;
  const userId = req.session[SESSION_USER_ID];

  if (req.method === 'POST') {
    if (!userId) {
      return endRequest(res, formatResponse(422, {}, '请先登录'));
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

export default withSessionRoute(postsHandler);

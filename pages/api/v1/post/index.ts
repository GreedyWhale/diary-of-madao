/*
 * @Description: 发布文章
 * @Author: MADAO
 * @Date: 2021-08-07 14:11:15
 * @LastEditors: MADAO
 * @LastEditTime: 2021-10-11 16:16:46
 */
import type { NextApiHandler } from 'next';

import { withIronSession } from 'next-iron-session';

import { responseData } from '~/utils/middlewares/index';
import { STORAGE_USER_ID } from '~/utils/constants';
import { sessionOptions } from '~/utils/withSession';
import postController from '~/controller/post';
import { formatResponse } from '~/utils/request/tools';

const post: NextApiHandler = async (req, res) => {
  const { postData } = req.body;
  const userId = req.session.get<number>(STORAGE_USER_ID);

  if (req.method === 'POST') {
    const post = await postController.updatePost(userId, postData);
    responseData(res, post);
    return;
  }

  if (req.method === 'GET') {
    const posts = await postController.getPosts({
      pageSize: parseInt(req.query.pageSize as string, 10),
      page: parseInt(req.query.page as string, 10),
      labelId: req.query.labelId ? parseInt(req.query.labelId as string, 10) : undefined
    });

    responseData(res, posts);
    return;
  }

  responseData(res, formatResponse(405), { Allow: 'GET, DELETE' });
};

export default withIronSession(post, sessionOptions);

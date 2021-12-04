/*
 * @Description: 博客详情接口
 * @Author: MADAO
 * @Date: 2021-09-24 17:48:28
 * @LastEditors: MADAO
 * @LastEditTime: 2021-10-14 14:35:57
 */
import type { NextApiHandler } from 'next';

import { withIronSession } from 'next-iron-session';

import postController from '~/controller/post';
import { responseData } from '~/utils/middlewares';
import { formatResponse } from '~/utils/request/tools';
import { sessionOptions } from '~/utils/withSession';
import { STORAGE_USER_ID } from '~/utils/constants';

const postDetail:NextApiHandler = async (req, res) => {
  const { id } = req.query;
  const { postData } = req.body;
  const userId = req.session.get<number>(STORAGE_USER_ID);

  if (req.method === 'GET') {
    const detail = await postController.getPostDetail(parseInt(id as string, 10));
    responseData(res, detail);
    return;
  }

  if (req.method === 'DELETE') {
    const result = await postController.deletePost(userId, parseInt(id as string, 10));
    responseData(res, result);
    return;
  }

  if (req.method === 'PUT') {
    const result = await postController.updatePost(userId, postData, parseInt(id as string, 10));
    responseData(res, result);
    return;
  }

  responseData(res, formatResponse(405), { Allow: 'GET, DELETE, PUT' });
};

export default withIronSession(postDetail, sessionOptions);

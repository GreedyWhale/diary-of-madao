/*
 * @Description: 笔记相关接口
 * @Author: MADAO
 * @Date: 2022-10-14 17:18:50
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-19 21:59:08
 */
import type { NextApiHandler } from 'next';

import NoteModel from '~/model/note';
import { formatResponse } from '~/lib/request';
import { withSessionRoute } from '~/lib/withSession';

const handler: NextApiHandler = async (req, res) => {
  const note = new NoteModel();

  if (req.method === 'POST') {
    const result = await note.create({
      ...req.body,
      userId: req.session.user?.id,
    });
    res.status(result.status).json(result);
    return;
  }

  if (req.method === 'GET') {
    const result = await note.index({
      page: typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : 1,
      pageSize: typeof req.query.pageSize === 'string' ? parseInt(req.query.pageSize, 10) : 1,
      labelId: typeof req.query.labelId === 'string' ? parseInt(req.query.labelId, 10) : undefined,
    });
    res.status(result.status).json(result);
    return;
  }

  res.setHeader('Allow', 'POST, GET');
  res.status(405).json(formatResponse({ status: 405 }));
};

export default withSessionRoute(handler);

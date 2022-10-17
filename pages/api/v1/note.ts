/*
 * @Description: 笔记相关接口
 * @Author: MADAO
 * @Date: 2022-10-14 17:18:50
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-17 22:19:45
 */
import type { NextApiHandler } from 'next';

import NoteModel from '~/model/note';
import { formatResponse } from '~/lib/request';
import { withSessionRoute } from '~/lib/withSession';

const handler: NextApiHandler = async (req, res) => {
  const note = new NoteModel();

  if (req.method === 'POST') {
    const result = await note.create(req.body);
    res.status(result.status).json(result);
    return;
  }

  res.setHeader('Allow', 'POST');
  res.status(405).json(formatResponse({ status: 405 }));
};

export default withSessionRoute(handler);

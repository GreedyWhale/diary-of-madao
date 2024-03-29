/*
 * @Description: 笔记相关接口
 * @Author: MADAO
 * @Date: 2022-10-14 17:18:50
 * @LastEditors: MADAO
 * @LastEditTime: 2022-11-03 15:13:51
 */
import type { Category } from '@prisma/client';

import NoteModel from '~/model/note';
import { withSessionRoute } from '~/lib/withSession';
import { withMiddleware } from '~/lib/middleware';
import { getNumberFromString } from '~/lib/number';

export default withSessionRoute(withMiddleware({
  async get(req, res) {
    const note = new NoteModel();
    const result = await note.index({
      page: getNumberFromString(req.query.page, 1),
      pageSize: getNumberFromString(req.query.pageSize, 1),
      labelId: getNumberFromString(req.query.labelId) ?? undefined,
      category: req.query.category as Category,
    });
    res.status(result.status).json(result);
  },
  async post(req, res) {
    const note = new NoteModel();
    const result = await note.create({
      ...req.body,
      userId: req.session.user?.id,
    });
    res.status(result.status).json(result);
  },
}));

/*
 * @Description: 获取笔记详情
 * @Author: MADAO
 * @Date: 2022-10-19 21:09:44
 * @LastEditors: MADAO
 * @LastEditTime: 2022-11-01 16:53:52
 */
import NoteModel from '~/model/note';
import { withSessionRoute } from '~/lib/withSession';
import { withMiddleware } from '~/lib/middleware';
import { getNumberFromString } from '~/lib/number';

export default withSessionRoute(withMiddleware({
  async get(req, res) {
    const note = new NoteModel();
    const result = await note.show(getNumberFromString(req.query.id));
    res.status(result.status).json(result);
  },

  async patch(req, res) {
    const note = new NoteModel();
    const result = await note.update({
      ...req.body,
      userId: req.session.user?.id,
      id: getNumberFromString(req.query.id),
    });
    res.status(result.status).json(result);
  },
}));

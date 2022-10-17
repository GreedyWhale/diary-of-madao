/*
 * @Description: note model
 * @Author: MADAO
 * @Date: 2022-10-14 17:19:56
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-17 22:36:14
 */
import type { Note } from '@prisma/client';
import type { Response } from '~/lib/request';
import type { Rules } from '~/lib/validator';

import { validator } from '~/lib/validator';
import { formatResponse } from '~/lib/request';
import { prisma } from '~/lib/db';
import { NOTE_CATEGORY } from '~/lib/constants';

export type CreateNoteParams = Pick<Note, 'title' | 'introduction' | 'category' | 'content'>
& { labels: string[]; userId: number; id?: number; };

export type NoteResponse = Response<Note>;

class Notes {
  validator(note: CreateNoteParams, extraRules: Rules<CreateNoteParams> = []) {
    const errors = validator(note, [
      { key: 'title', message: '标题不可为空', required: true },
      { key: 'introduction', message: '简介不可为空', required: true },
      { key: 'category', message: '笔记类型错误', required: value => NOTE_CATEGORY.includes(value as string) },
      { key: 'content', message: '内容不可为空', required: true },
      { key: 'labels', message: '至少选择一个标签', required: value => Boolean((value as CreateNoteParams['labels']).length) },
      ...extraRules,
    ]);

    return errors;
  }

  async create(note: CreateNoteParams): Promise<NoteResponse> {
    try {
      const errors = this.validator(note);
      if (errors) {
        return formatResponse({ status: 422, errors });
      }

      const { labels, userId, id, ...rest } = note;
      const newNote = await prisma.note.create({
        data: {
          ...rest,
          author: {
            connect: { id: userId },
          },
          labels: {
            connectOrCreate: labels.map(label => ({
              create: { name: label },
              where: { name: label },
            })),
          },
        },
        include: {
          labels: {
            select: { name: true },
          },
        },
      });

      return formatResponse({ resource: newNote });
    } catch (error) {
      const _error = error as Error;
      return formatResponse({ status: 500, message: _error.message });
    }
  }

  async update(note: CreateNoteParams): Promise<NoteResponse> {
    try {
      const errors = this.validator(note, [{ key: 'id', message: 'id不可为空', required: true }]);
      if (errors) {
        return formatResponse({ status: 422, errors });
      }

      const { labels, userId, id, ...rest } = note;
      const newNote = await prisma.note.update({
        where: { id },
        data: {
          ...rest,
          author: {
            connect: { id: userId },
          },
          labels: {
            connectOrCreate: labels.map(label => ({
              create: { name: label },
              where: { name: label },
            })),
          },
        },

      });

      return formatResponse({ resource: newNote });
    } catch (error) {
      const _error = error as Error;
      return formatResponse({ status: 500, message: _error.message });
    }
  }
}

export default Notes;

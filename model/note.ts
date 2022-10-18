/*
 * @Description: note model
 * @Author: MADAO
 * @Date: 2022-10-14 17:19:56
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-18 23:08:31
 */
import type { Note } from '@prisma/client';
import type { Response } from '~/lib/request';
import type { Rules } from '~/lib/validator';

import fse from 'fs-extra';
import path from 'path';

import { validator } from '~/lib/validator';
import { formatResponse } from '~/lib/request';
import { prisma } from '~/lib/db';
import { NOTE_CATEGORY } from '~/lib/constants';

export type CreateNoteParams = Pick<Note, 'title' | 'introduction' | 'category' | 'content'>
& { labels: string[]; userId: number; id?: number; };

export type NoteResponse = Response<Note>;

class Notes {
  async validator(note: CreateNoteParams, extraRules: Rules<CreateNoteParams> = []) {
    const errors = validator(note, [
      { key: 'title', message: '标题不可为空', required: true },
      { key: 'introduction', message: '简介不可为空', required: true },
      { key: 'category', message: '笔记类型错误', required: value => NOTE_CATEGORY.includes(value as string) },
      { key: 'content', message: '内容不可为空', required: true },
      { key: 'labels', message: '至少选择一个标签', required: value => Boolean((value as CreateNoteParams['labels']).length) },
      ...extraRules,
    ]);

    if (errors) {
      return Promise.reject(formatResponse({ status: 422, errors }));
    }
  }

  async generateStaticFiles(userId: number, title: string, content: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await fse.outputFile(path.join(process.cwd(), `/static/notes/${userId}/${title}.md`), content);
    } catch (error) {
      return Promise.reject(formatResponse({ status: 500, message: (error as Error).message }));
    }
  }

  async create(note: CreateNoteParams) {
    const { labels, userId, id, ...rest } = note;
    const createNote = async (): Promise<NoteResponse> => {
      try {
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
        return formatResponse({ status: 500, message: (error as Error).message });
      }
    };

    try {
      await this.validator(note);
      await this.generateStaticFiles(userId, note.title, note.content);
      return await createNote();
    } catch (error) {
      return error as Promise<NoteResponse>;
    }
  }

  async update(note: CreateNoteParams) {
    const { labels, userId, id, ...rest } = note;
    const updateNote = async (): Promise<NoteResponse> => {
      try {
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
        return formatResponse({ status: 500, message: (error as Error).message });
      }
    };

    try {
      await this.validator(note, [{ key: 'id', message: 'id不可为空', required: true }]);
      await this.generateStaticFiles(userId, note.title, note.content);
      return await updateNote();
    } catch (error) {
      return error as Promise<NoteResponse>;
    }
  }
}

export default Notes;

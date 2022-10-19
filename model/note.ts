/*
 * @Description: note model
 * @Author: MADAO
 * @Date: 2022-10-14 17:19:56
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-19 21:59:46
 */
import type { Note } from '@prisma/client';
import type { Response } from '~/lib/request';
import type { Rules, FormData } from '~/lib/validator';

import fse from 'fs-extra';
import path from 'path';

import { validator } from '~/lib/validator';
import { formatResponse } from '~/lib/request';
import { prisma } from '~/lib/db';
import { NOTE_CATEGORY } from '~/lib/constants';
import { exclude } from '~/lib/exclude';

export type Pagination = {
  pageSize: number;
  page: number;
};
export type NoteResponse = Response<Note>;
export type NotesResponse = Response<{
  list: Array<Omit<Note, 'content'> & {
    labels: Array<{
      name: string;
    }>;
    author: {
      username: string;
    };
  }>;
  pagination: Pagination & { total: number; };
}>;

export type CreateNoteParams = Pick<Note, 'title' | 'introduction' | 'category' | 'content'>
& { labels: string[]; userId: number; id?: number; };
export type GetNotesParams = Pagination & { labelId?: number; };

const createNoteRules: Rules<CreateNoteParams> = [
  { key: 'title', message: '标题不可为空', required: true },
  { key: 'introduction', message: '简介不可为空', required: true },
  { key: 'category', message: '笔记类型错误', required: value => NOTE_CATEGORY.includes(value as string) },
  { key: 'content', message: '内容不可为空', required: true },
  { key: 'labels', message: '至少选择一个标签', required: value => Boolean((value as CreateNoteParams['labels']).length) },
];

const getNotesRules: Rules<GetNotesParams> = [
  { key: 'pageSize', message: 'pageSize不可为空', required: true },
  { key: 'page', message: 'page不可为空', required: true },
];

class Notes {
  async validator<T extends FormData>(formData: T, rules: Rules<T> = []) {
    const errors = validator(formData, rules);

    if (errors) {
      return Promise.reject(formatResponse({ status: 422, errors: errors as Response['errors'] }));
    }
  }

  async generateStaticFiles(userId: number, title: string, content: string) {
    try {
      await fse.outputFile(path.join(process.cwd(), `/public/static/notes/${userId}/${title}.md`), content);
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
      await this.validator(note, createNoteRules);
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
        await this.validator(note, createNoteRules.concat([{ key: 'id', message: 'id不可为空', required: true }]));
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

  async index(params: GetNotesParams) {
    const getNotes = async (): Promise<NotesResponse> => {
      try {
        const notes = await prisma.$transaction([
          prisma.note.findMany({
            skip: params.page === 1 ? 0 : (params.page - 1) * params.pageSize,
            take: params.pageSize,
            where: params.labelId
              ? { labels: { some: { id: params.labelId } } }
              : {},
            include: {
              author: {
                select: { username: true },
              },
              labels: {
                select: { name: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.note.count({
            where: params.labelId
              ? { labels: { some: { id: params.labelId } } }
              : {},
          }),
        ]);

        return formatResponse({
          resource: {
            list: notes[0].map(note => exclude(note, 'content')),
            pagination: {
              pageSize: params.pageSize,
              page: params.page,
              total: notes[1],
            },
          },
        });
      } catch (error) {
        return formatResponse({ status: 500, message: (error as Error).message });
      }
    };

    try {
      await this.validator(params, getNotesRules);
      return await getNotes();
    } catch (error) {
      return error as Promise<NotesResponse>;
    }
  }
}

export default Notes;

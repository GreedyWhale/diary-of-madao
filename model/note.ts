/*
 * @Description: note model
 * @Author: MADAO
 * @Date: 2022-10-14 17:19:56
 * @LastEditors: MADAO
 * @LastEditTime: 2022-11-03 15:22:31
 */
import type { Note, Category, Label, User } from '@prisma/client';
import type { Response } from '~/lib/api';
import type { Rules } from '~/lib/validator';

import fse from 'fs-extra';
import path from 'path';

import BaseModel from './index';
import { formatResponse } from '~/lib/api';
import { prisma } from '~/lib/db';
import { NOTE_CATEGORY } from '~/lib/constants';
import { exclude } from '~/lib/exclude';

export type Pagination = {
  pageSize: number;
  page: number;
};

export type NoteWithoutContent = Omit<Note, 'content'> & {
  labels: Array<{ name: string; }>;
  author: { username: string; };
};

export type NoteResponse = Response<(Note & {
  labels: Label[];
  author: Pick<User, 'username'>;
}) | null>;

export type NotesResponse = Response<{
  list: NoteWithoutContent[];
  pagination: Pagination & { total: number; totalPage: number; };
}>;

export type CreateNoteParams = Pick<Note, 'title' | 'introduction' | 'category' | 'content'>
& { labels: string[]; userId: number; id?: number; };
export type GetNotesParams = Pagination & { labelId?: number; category?: Category; };

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

class Notes extends BaseModel {
  async generateStaticFiles(userId: number, title: string, content: string) {
    try {
      await fse.outputFile(path.join(process.cwd(), `/public/notes/${userId}/${title}.md`), content);
    } catch (error) {
      return Promise.reject(formatResponse({ status: 500, message: (error as Error).message }));
    }
  }

  async create(note: CreateNoteParams) {
    const { labels, userId, id, ...rest } = note;

    try {
      await this.validator(note, createNoteRules);
      await this.generateStaticFiles(userId, note.title, note.content);
      return await this.execSql(prisma.note.create({
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
          labels: true,
          author: {
            select: { username: true },
          },
        },
      }));
    } catch (error) {
      return error as Promise<NoteResponse>;
    }
  }

  async update(note: CreateNoteParams) {
    const { labels, userId, id, ...rest } = note;

    try {
      await this.validator(note, [...createNoteRules, { key: 'id', message: 'id不可为空', required: true }]);
      await this.generateStaticFiles(userId, note.title, note.content);
      return await this.execSql(prisma.note.update({
        where: { id },
        data: {
          ...rest,
          authorId: userId,
          labels: {
            connectOrCreate: labels.map(label => ({
              create: { name: label },
              where: { name: label },
            })),
          },
        },
        include: {
          labels: true,
          author: {
            select: { username: true },
          },
        },
      }));
    } catch (error) {
      return error as Promise<NoteResponse>;
    }
  }

  async index(params: GetNotesParams) {
    const getWhereRules = () => {
      if (params.labelId && params.category) {
        return {
          labels: { every: { id: params.labelId } },
          category: params.category,
        };
      }

      if (params.labelId) {
        return {
          labels: { every: { id: params.labelId } },
        };
      }

      if (params.category) {
        return {
          category: params.category,
        };
      }

      return {};
    };

    try {
      await this.validator(params, getNotesRules);
      return await this.execSql(
        prisma.$transaction([
          prisma.note.findMany({
            skip: params.page === 1 ? 0 : (params.page - 1) * params.pageSize,
            take: params.pageSize,
            where: getWhereRules(),
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
            where: getWhereRules(),
          }),
        ]),

        notes => formatResponse({
          resource: {
            list: notes[0].map(note => exclude(note, 'content')),
            pagination: {
              pageSize: params.pageSize,
              page: params.page,
              total: notes[1],
              totalPage: Math.ceil(notes[1] / params.pageSize),
            },
          },
        }),
      );
    } catch (error) {
      return error as Promise<NotesResponse>;
    }
  }

  async show(id: number) {
    try {
      await this.validator({ id }, [{ key: 'id', message: '笔记id不可为空', required: true }]);
      return await this.execSql(prisma.note.findUnique({
        where: { id },
        include: {
          labels: true,
          author: {
            select: { username: true },
          },
        },
      }));
    } catch (error) {
      return error as Promise<NoteResponse>;
    }
  }
}

export default Notes;

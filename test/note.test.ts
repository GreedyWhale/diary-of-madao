/*
 * @Description: note 相关测试
 * @Author: MADAO
 * @Date: 2022-12-09 15:16:32
 * @LastEditors: MADAO
 * @LastEditTime: 2022-12-09 16:16:24
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type CreateNoteParams = {
  title: string;
  introduction: string;
  category: 'TECHNICAL' | 'READING';
  content: string;
  authorId: number;
  labels: string[];
};

type UpdateNoteParams = CreateNoteParams & {
  id: number;
};

type QueryParams = {
  pageSize: number; // 每页条数
  page: number; // 当前页
  labelId: number;
};

const note: CreateNoteParams = {
  title: '测试',
  introduction: '测试一下',
  category: 'TECHNICAL',
  content: '这是一篇测试文章',
  authorId: 2,
  labels: ['test'],
};

const updateParams: UpdateNoteParams = {
  id: 9,
  title: '测试1',
  introduction: '测试一下1',
  category: 'TECHNICAL',
  content: '这是一篇测试文章1',
  authorId: 2,
  labels: ['test', 'test1'],
};

const queryParams: QueryParams = {
  pageSize: 10,
  page: 1,
  labelId: 1,
};

const createNote = async () => {
  const { labels, authorId, ...rest } = note;

  const newNote = await prisma.note.create({
    data: {
      ...rest,
      author: {
        connect: { id: authorId },
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
  });

  console.log(newNote);
};

const updateNote = async () => {
  const { id, labels, authorId, ...rest } = updateParams;

  const newNote = await prisma.note.update({
    where: { id },
    data: {
      ...rest,
      authorId,
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
  });

  console.log(newNote);
};

const deleteNote = async (id: number) => {
  await prisma.note.delete({
    where: { id },
  });
};

const getNotes = async () => {
  const notes = await prisma.$transaction([
    // 语句一
    prisma.note.findMany({
      skip: queryParams.page === 1 ? 0 : (queryParams.page - 1) * queryParams.pageSize,
      take: queryParams.pageSize,
      where: {
        labels: { some: { id: queryParams.labelId } },
      },
      include: {
        author: {
          select: { username: true },
        },
        labels: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

    // 语句二
    prisma.note.count({
      where: {
        labels: { some: { id: queryParams.labelId } },
      },
    }),
  ]);

  console.log(notes);
};

// CreateNote();

// UpdateNote();

// deleteNote(9);

getNotes();

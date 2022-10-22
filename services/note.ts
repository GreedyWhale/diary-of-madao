/*
 * @Description: 笔记相关请求
 * @Author: MADAO
 * @Date: 2022-10-17 21:44:33
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-22 10:52:40
 */
import type {
  CreateNoteParams,
  GetNotesParams,
  NoteResponse,
  NotesResponse,
} from '~/model/note';

import request from '~/lib/request';

import { apiNote } from './api';

export const createNote = async (params: Omit<CreateNoteParams, 'userId'>) => request.post<NoteResponse>(apiNote, params);

export const getNotes = async (params: GetNotesParams) => request.get<NotesResponse>(apiNote, { params });

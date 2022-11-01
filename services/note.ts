/*
 * @Description: 笔记相关请求
 * @Author: MADAO
 * @Date: 2022-10-17 21:44:33
 * @LastEditors: MADAO
 * @LastEditTime: 2022-11-01 16:45:02
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

export const getNoteDetails = async (id: number) => request.get<NoteResponse>(`${apiNote}/${id}`);

export const updateNote = async (id: number, params: Omit<CreateNoteParams, 'userId'>) => request.patch<NoteResponse>(`${apiNote}/${id}`, params);

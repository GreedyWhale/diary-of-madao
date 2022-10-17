/*
 * @Description: 笔记相关请求
 * @Author: MADAO
 * @Date: 2022-10-17 21:44:33
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-17 21:47:11
 */
import type { CreateNoteParams, NoteResponse } from '~/model/note';

import request from '~/lib/request/axios';

import { apiNote } from './api';

export const createNote = async (params: CreateNoteParams) => request.post<NoteResponse>(apiNote, params);

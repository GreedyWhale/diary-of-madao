/*
 * @Description: 笔记相关请求
 * @Author: MADAO
 * @Date: 2022-10-17 21:44:33
 * @LastEditors: MADAO
 * @LastEditTime: 2022-11-01 20:46:03
 */
import type {
  CreateLabelParams,
  LabelResponse,
  LabelsResponse,
} from '~/model/label';

import request from '~/lib/request';

import { apiLabel } from './api';

export const createLabel = async (params: Omit<CreateLabelParams, 'userId'>) => request.post<LabelResponse>(apiLabel, params);

export const getLabels = async () => request.get<LabelsResponse>(apiLabel);

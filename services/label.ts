/*
 * @Description: 文章标签相关请求
 * @Author: MADAO
 * @Date: 2022-03-08 12:13:49
 * @LastEditors: MADAO
 * @LastEditTime: 2022-03-08 12:22:16
 */
import type { LabelListResponse } from '~/types/services/label';

import request from '~/utils/request';

import { apiLabel } from './api';

export const getLabels = () => request.get<LabelListResponse>(apiLabel);

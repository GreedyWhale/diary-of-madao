/*
 * @Description: 用户相关请求
 * @Author: MADAO
 * @Date: 2022-09-30 15:57:59
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-22 10:52:43
 */
import type { Response } from '~/lib/api';
import type { UserInfo } from '~/model/user';

import request from '~/lib/request';

import { apiLogin, apiUser } from './api';

export const login = async (params: {
  username: string;
  password: string;
}) => request.post<Response<UserInfo>>(apiLogin, params);

export const getUserInfo = async () => request.get<Response<UserInfo>>(apiUser);

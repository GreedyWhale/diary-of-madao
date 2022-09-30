/*
 * @Description: 用户相关请求
 * @Author: MADAO
 * @Date: 2022-09-30 15:57:59
 * @LastEditors: MADAO
 * @LastEditTime: 2022-09-30 17:58:58
 */
import type { Response } from '~/lib/request';
import type { UserInfo } from '~/model/user';

import request from '~/lib/request/axios';

import { apiLogin, apiUser } from './api';

export const login = async (params: {
  username: string;
  password: string;
}) => request.post<Response<UserInfo>>(apiLogin, params);

export const getUserInfo = async () => request.get<Response<UserInfo>>(apiUser);

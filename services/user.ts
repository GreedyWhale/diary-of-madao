/*
 * @Description: 用户相关请求
 * @Author: MADAO
 * @Date: 2021-07-28 17:29:44
 * @LastEditors: MADAO
 * @LastEditTime: 2022-02-23 18:28:24
 */
import type { UserResponse } from '~/types/services/user';
import type { API } from '~/types/API';

import request from '~/utils/request';
import { apiUser } from '~/services/api';

export const signIn = (params: {
  username: string;
  password: string;
}) => (
  request.get<API.ResponseData<UserResponse>>(apiUser, { params })
);

export const signUp = (params: {
  username: string;
  password: string;
}) => (
  request.post<API.ResponseData<UserResponse>>(apiUser, params)
);

export const signOut = () => (
  request.delete<API.ResponseData<UserResponse>>(apiUser)
);

export const getUserInfo = () => (
  request.get<API.ResponseData<UserResponse>>(apiUser, { showErrorNotification: false })
);

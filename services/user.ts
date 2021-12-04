/*
 * @Description: 用户相关请求
 * @Author: MADAO
 * @Date: 2021-07-28 17:29:44
 * @LastEditors: MADAO
 * @LastEditTime: 2021-09-15 18:31:09
 */
import type { UserResponse } from '~/controller/user';

import request from '~/utils/request';
import { apiUser } from '~/services/api';

export const signIn = (params: {
  username: string;
  password: string;
}) => (
  request.post<UserResponse>(apiUser, params)
);

export const signOut = () => (
  request.delete<UserResponse>(apiUser)
);

export const getUserInfo = () => (
  request.get<UserResponse>(apiUser, { showErrorNotification: false })
);

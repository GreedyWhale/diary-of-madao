/*
 * @Description: 用户相关hook
 * @Author: MADAO
 * @Date: 2022-09-30 17:27:37
 * @LastEditors: MADAO
 * @LastEditTime: 2022-11-03 14:38:49
 */
import React from 'react';
import { useSetAtom, useAtom } from 'jotai';
import useSWR from 'swr';

import { userIdAtom } from '~/store/user';
import { apiUser } from '~/services/api';
import { getUserInfo, logout } from '~/services/user';

export const useUpdateUserId = (userId?: number) => {
  const setUserId = useSetAtom(userIdAtom);
  React.useEffect(() => {
    if (userId) {
      setUserId(userId);
    }
  }, [userId, setUserId]);
};

export const useUser = () => {
  const [userId, setUserId] = useAtom(userIdAtom);

  const { data, mutate } = useSWR(userId ? apiUser : null, getUserInfo);

  const doLogout = React.useCallback(async () => {
    await logout();
    setUserId(0);
    mutate(undefined, false);
  }, [mutate, setUserId]);

  return {
    user: data ? data.data.resource : null,
    logout: doLogout,
  };
};

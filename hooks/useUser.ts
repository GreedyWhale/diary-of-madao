/*
 * @Description: 用户相关hook
 * @Author: MADAO
 * @Date: 2022-09-30 17:27:37
 * @LastEditors: MADAO
 * @LastEditTime: 2022-09-30 17:59:05
 */
import React from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import useSWR from 'swr';

import { userIdAtom } from '~/store/user';
import { apiUser } from '~/services/api';
import { getUserInfo } from '~/services/user';

export const useUserId = (userId?: number) => {
  const setUserId = useSetAtom(userIdAtom);
  React.useEffect(() => {
    if (userId) {
      setUserId(userId);
    }
  }, [userId, setUserId]);
};

export const useUser = () => {
  const userId = useAtomValue(userIdAtom);

  const { data } = useSWR(userId ? apiUser : null, getUserInfo);

  return {
    user: data ? data.data.resource : null,
  };
};

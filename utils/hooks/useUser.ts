/*
 * @Description: 用户相关hook
 * @Author: MADAO
 * @Date: 2021-07-29 22:05:08
 * @LastEditors: MADAO
 * @LastEditTime: 2021-10-11 16:48:18
 */
import React from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { getUserInfo, signOut } from '~/services/user';
import { apiUser } from '~/services/api';
import { useAppDispatch, useAppSelector } from '~/utils/hooks/useRedux';
import { updateUserId } from '~/store/slice/user';

const initialUser = {
  id: -1,
  username: '',
  access: []
};

export const useUpdateUserId = (userId: number) => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (userId !== -1) {
      dispatch(updateUserId(userId));
    }
  }, [dispatch, userId]);
};

export const useSignOut = () => {
  const { mutate } = useSWRConfig();
  const dispatch = useAppDispatch();

  const doSignOut = async () => {
    await signOut()
      .then(() => {
        mutate(apiUser, initialUser, false);
        dispatch(updateUserId(-1));
      });
  };

  return doSignOut;
};

const useUser = () => {
  const userId = useAppSelector(state => state.user.id);
  const { data: response, error } = useSWR(
    userId === -1 ? null : apiUser,
    getUserInfo,
    { shouldRetryOnError: false }
  );

  return {
    user: (response && response.data) ? response.data : initialUser,
    isLoading: (!error && !response) && userId !== -1,
    isError: error
  };
};

export default useUser;

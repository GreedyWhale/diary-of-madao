/*
 * @Description: 用户相关hook
 * @Author: MADAO
 * @Date: 2021-07-29 22:05:08
 * @LastEditors: MADAO
 * @LastEditTime: 2022-03-04 11:21:21
 */
import type { SignOutDialogProps } from '~/types/hooks/useUser';
import type { UserResponse } from '~/types/services/user';

import React from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { getUserInfo, signOut } from '~/services/user';
import { apiUser } from '~/services/api';
import { useAppDispatch, useAppSelector } from '~/utils/hooks/useRedux';
import { updateUserId } from '~/store/slice/user';

import Dialog from '~/components/Dialog';
import Button from '~/components/Button';

const initialUser: Omit<UserResponse, 'access'> & { access: string[]; } = {
  id: -1,
  username: '',
  access: [],
  createdAt: new Date(),
  updatedAt: new Date(),
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

  const SignOutDialog: React.FC<SignOutDialogProps> = props => {
    const handleCancel = async () => props.onCancel();
    const handleConfirm = async () => {
      await doSignOut();
      props.onConfirm();
    };

    return (
      <Dialog
        open={props.open}
        title="退出登录"
        content="是否退出当前账号？"
        onClose={props.onCancel}
        actions={[
          <Button key="cancel" variant="outlined" color="secondary" onClick={handleCancel}>取消</Button>,
          <Button key="confirm" variant="contained" color="primary" onClick={handleConfirm}>确定</Button>,
        ]}
      />
    );
  };

  return {
    signOut: doSignOut,
    SignOutDialog,
  };
};

const useUser = () => {
  const userId = useAppSelector(state => state.user.id);
  const { data: response, error } = useSWR(
    userId === -1 ? null : apiUser,
    getUserInfo,
    { shouldRetryOnError: false },
  );

  const formatUser = (user?: UserResponse) => {
    if (!user) {
      return initialUser;
    }

    return {
      ...user,
      access: user.access.map(value => value.access.name),
    };
  };

  return {
    user: formatUser(response?.data?.data),
    isLoading: (!error && !response) && userId !== -1,
    isError: error,
  };
};

export default useUser;

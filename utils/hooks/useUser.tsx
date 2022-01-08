/*
 * @Description: 用户相关hook
 * @Author: MADAO
 * @Date: 2021-07-29 22:05:08
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-05 22:32:11
 */
import type { SignOutDialogProps } from '~/types/useUser';

import React from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { getUserInfo, signOut } from '~/services/user';
import { apiUser } from '~/services/api';
import { useAppDispatch, useAppSelector } from '~/utils/hooks/useRedux';
import { updateUserId } from '~/store/slice/user';

import Dialog from '~/components/Dialog';
import Button from '~/components/Button';

const initialUser = {
  id: -1,
  username: '',
  access: [],
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

  return {
    user: (response && response.data) ? response.data.data : initialUser,
    isLoading: (!error && !response) && userId !== -1,
    isError: error,
  };
};

export default useUser;
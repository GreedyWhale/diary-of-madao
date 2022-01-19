/*
 * @Description: 登录用户数据
 * @Author: MADAO
 * @Date: 2021-07-28 21:18:05
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-19 15:56:52
 */
import type { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from '@reduxjs/toolkit';

interface InitialState {
  id: number;
}

export const initialState: InitialState = {
  id: -1,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUserId: (state, action: PayloadAction<InitialState['id']>) => {
      state.id = action.payload;
    },
  },
});

export const { updateUserId } = userSlice.actions;

export default userSlice.reducer;

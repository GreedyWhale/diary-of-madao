/*
 * @Description: 全局数据
 * @Author: MADAO
 * @Date: 2021-07-28 21:11:00
 * @LastEditors: MADAO
 * @LastEditTime: 2021-08-02 12:37:27
 */
import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import userReducer from './slice/user';

const createStore = () => {
  return configureStore({
    reducer: {
      user: userReducer
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger)
  });
};

export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>;
export type AppDispatch = ReturnType<typeof createStore>['dispatch'];

export default createStore;


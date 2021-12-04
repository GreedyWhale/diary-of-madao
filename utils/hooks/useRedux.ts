/*
 * @Description: redux 相关hooks
 * @Author: MADAO
 * @Date: 2021-07-28 21:23:33
 * @LastEditors: MADAO
 * @LastEditTime: 2021-07-28 21:24:58
 */
import type { RootState, AppDispatch } from '~/store/index';
import type { TypedUseSelectorHook } from 'react-redux';

import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

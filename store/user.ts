/*
 * @Description: user 数据
 * @Author: MADAO
 * @Date: 2022-09-30 17:13:48
 * @LastEditors: MADAO
 * @LastEditTime: 2022-09-30 17:27:01
 */
import type { UserInfo } from '~/model/user';

import { atom } from 'jotai';

export const userIdAtom = atom(0);
export const userAtom = atom<UserInfo>({ id: 0, username: '' });

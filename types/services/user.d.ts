/*
 * @Description: 请求user相关类型声明
 * @Author: MADAO
 * @Date: 2021-12-14 14:13:02
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-14 14:16:04
 */
import type { User } from '@prisma/client';

export type UserResponse = Pick<User, 'id' | 'username' | 'access'>;

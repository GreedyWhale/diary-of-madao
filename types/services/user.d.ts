/*
 * @Description: 请求user相关类型声明
 * @Author: MADAO
 * @Date: 2021-12-14 14:13:02
 * @LastEditors: MADAO
 * @LastEditTime: 2022-02-23 17:40:12
 */
import type { User, Access } from '@prisma/client';

export type UserResponse = Omit<User, 'passwordDigest'> & { access: { access: Access }[] };

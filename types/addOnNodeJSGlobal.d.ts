/* eslint-disable no-unused-vars */
/*
 * @Description: 扩展nodejs global对象
 * @Author: MADAO
 * @Date: 2021-08-02 19:22:05
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-06 12:13:07
 */
import { PrismaClient } from '@prisma/client';

export type CustomGlobal = typeof globalThis & {
  prisma: PrismaClient;
};

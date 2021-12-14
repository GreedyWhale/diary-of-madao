/*
 * @Description: 扩展nodejs global对象
 * @Author: MADAO
 * @Date: 2021-08-02 19:22:05
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-14 11:16:43
 */
import { PrismaClient } from '@prisma/client';

export type CustomGlobal = typeof globalThis & {
  prisma: PrismaClient;
};

/* eslint-disable no-unused-vars */
/*
 * @Description: 扩展nodejs global对象
 * @Author: MADAO
 * @Date: 2021-08-02 19:22:05
 * @LastEditors: MADAO
 * @LastEditTime: 2021-08-02 19:59:19
 */
import { PrismaClient } from '@prisma/client';

declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient;
    }
  }
}

/*
 * @Description: prisma 相关方法
 * @Author: MADAO
 * @Date: 2021-07-29 22:43:19
 * @LastEditors: MADAO
 * @LastEditTime: 2021-09-14 11:21:01
 */
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }

  prisma = global.prisma;
}

export default prisma;


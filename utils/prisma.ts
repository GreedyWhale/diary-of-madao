/*
 * @Description: prisma 相关方法
 * @Author: MADAO
 * @Date: 2021-07-29 22:43:19
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-06 12:14:03
 */
import type { CustomGlobal } from '~/types/addOnNodeJSGlobal';

import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if ((global as CustomGlobal).prisma) {
    (global as CustomGlobal).prisma = new PrismaClient();
  }

  prisma = (global as CustomGlobal).prisma;
}

export default prisma;


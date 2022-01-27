/*
 * @Description: https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 * @Author: MADAO
 * @Date: 2021-07-29 22:43:19
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-27 14:35:40
 */
import { PrismaClient } from '@prisma/client';

const prisma = global.prisma || new PrismaClient({ log: ['query'] });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

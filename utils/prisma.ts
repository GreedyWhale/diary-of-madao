/*
 * @Description: https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 * @Author: MADAO
 * @Date: 2021-07-29 22:43:19
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-13 14:42:32
 */
import type { CustomGlobal } from '~/types/addOnNodeJSGlobal';

import { PrismaClient } from '@prisma/client';

const prisma = (global as CustomGlobal).prisma || new PrismaClient({ log: ['query'] });

if (process.env.NODE_ENV !== 'production') {
  (global as CustomGlobal).prisma = prisma;
}

export default prisma;

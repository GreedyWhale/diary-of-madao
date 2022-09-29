/*
 * @Description: https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 * @Author: MADAO
 * @Date: 2022-09-28 17:20:29
 * @LastEditors: MADAO
 * @LastEditTime: 2022-09-28 18:09:20
 */
import { PrismaClient } from '@prisma/client';

export const prisma = global.prisma ?? new PrismaClient({ log: ['query'] });

if (process.env.NODE_ENV !== 'production') { global.prisma = prisma; }

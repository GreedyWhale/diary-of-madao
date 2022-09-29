/*
 * @Description: 全局类型扩展
 * @Author: MADAO
 * @Date: 2022-09-28 17:21:31
 * @LastEditors: MADAO
 * @LastEditTime: 2022-09-28 18:11:07
 */
import type { PrismaClient } from '@prisma/client';

declare global {
  // 这里一定要用var，不能用const，fuck ts and eslint
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}


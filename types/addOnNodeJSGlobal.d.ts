/*
 * @Description: 扩展nodejs global对象
 * @Author: MADAO
 * @Date: 2021-08-02 19:22:05
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-27 14:35:17
 */
import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

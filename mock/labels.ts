/*
 * @Description: mock label数据
 * @Author: MADAO
 * @Date: 2022-03-08 15:56:18
 * @LastEditors: MADAO
 * @LastEditTime: 2022-03-08 16:17:32
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
  await prisma.label.createMany({
    data: Array.from({ length: 100 }, (v, i) => i + 1).map(value => ({
      name: `test ${value}`,
    })),
  }).then(res => {
    console.log('done:', res);
  });
};

main();

/*
 * @Description: 测试User表和Note表之间的关系
 * @Author: MADAO
 * @Date: 2022-12-09 12:30:23
 * @LastEditors: MADAO
 * @LastEditTime: 2022-12-09 12:38:11
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createUser = async () => {
  await prisma.user.create({
    data: { username: 'test_user', password: '123456' },
  });
};

const getUser = async () => {
  const user = await prisma.user.findUnique({
    where: { id: 2 },
    include: { notes: true },
  });

  console.log(user);
};

createUser();
getUser();

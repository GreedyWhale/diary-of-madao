/*
 * @Description: user 表控制器
 * @Author: MADAO
 * @Date: 2021-09-15 14:46:09
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-06 11:09:10
 */
import type { User } from '@prisma/client';

import sha3 from 'crypto-js/sha3';
import { omit } from 'lodash';

import prisma from '~/utils/prisma';
import { userFormValidator } from '~/utils/validator';
import { formatResponse } from '~/utils/request/tools';
import { promiseSettled } from '~/utils/promise';
import {
  ACCESS_POST_EDIT,
  ACCESS_POST_DELETE,
  ACCESS_IMAGE_UPLOAD,
  ACCESS_GIT_SYNC,
  ADMIN_USER,
} from '~/utils/constants';

export type UserResponse = Pick<User, 'id' | 'username' | 'access'>;
type QueryUserCondition = Partial<{
  id: number;
  username: string;
}>;
type UserInfo = {
  username: string;
  password: string;
};

export const ACCESS_MAP: Record<string, string[]> = {
  [ADMIN_USER]: [
    ACCESS_POST_EDIT,
    ACCESS_POST_DELETE,
    ACCESS_IMAGE_UPLOAD,
    ACCESS_GIT_SYNC,
  ],
};

const userController = {
  cryptoPassword(password: string) {
    return sha3(password, { outputLength: 256 }).toString();
  },
  omitUser(user: UserResponse & { passwordDigest: string }) {
    return omit(user, ['passwordDigest']);
  },
  userValidator(userInfo: UserInfo) {
    const isPassed = userFormValidator(userInfo.username, userInfo.password);
    if (isPassed !== true) {
      return formatResponse(422, null, isPassed);
    }

    return isPassed;
  },
  async createRow(userInfo: UserInfo) {
    const [user, error] = await promiseSettled(prisma.user.create({
      data: {
        username: userInfo.username,
        passwordDigest: userController.cryptoPassword(userInfo.password),
        access: ACCESS_MAP[userInfo.username] || [],
      },
    }));

    if (error) {
      return Promise.reject(formatResponse(500, error, error.message));
    }

    return formatResponse(200, userController.omitUser(user as User), '注册成功');
  },
  async getUser(condition: QueryUserCondition) {
    const [user, error] = await promiseSettled(prisma.user.findUnique({
      where: condition,
      select: {
        username: true,
        id: true,
        passwordDigest: true,
        access: true,
      },
    }));

    if (error) {
      return Promise.reject(formatResponse(500, error, error.message));
    }

    return user;
  },
  async signIn(condition: QueryUserCondition, password?: string) {
    const [user, userError] = await promiseSettled(userController.getUser(condition));
    if (userError) {
      return Promise.reject(userError);
    }

    if (!user) {
      return Promise.reject(formatResponse(404, null, '用户不存在'));
    }

    if (password && userController.cryptoPassword(password) !== user.passwordDigest) {
      return Promise.reject(formatResponse(422, null, '用户密码错误'));
    }

    return formatResponse(200, userController.omitUser(user), '登录成功');
  },
  async signUp(username: string, password: string) {
    const userInfo = { username, password };
    const isPassed = userController.userValidator(userInfo);
    if (!isPassed) {
      return Promise.reject(isPassed);
    }

    const [user, sigInError] = await promiseSettled(userController.signIn({ username }, password));
    if (user) {
      return user;
    }

    if (sigInError.code !== 404) {
      return Promise.reject(sigInError);
    }

    if (username !== ADMIN_USER) {
      return Promise.reject(formatResponse(405, null, '因为备案的原因，不支持注册，EL PSY CONGROO!'));
    }

    const [newUser, signUpError] = await promiseSettled(userController.createRow(userInfo));
    if (signUpError) {
      return Promise.reject(signUpError);
    }

    return newUser;
  },
};

export default userController;

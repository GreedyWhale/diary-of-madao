/*
 * @Description: user 表控制器
 * @Author: MADAO
 * @Date: 2021-09-15 14:46:09
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-13 17:08:22
 */
import type { UserQueryConditions, AccessMap } from '~/types/userController';

import sha3 from 'crypto-js/sha3';
import { omit } from 'lodash';

import prisma from '~/utils/prisma';
import { userFormValidator } from '~/utils/validator';
import { formatResponse } from '~/utils/request/tools';
import { promiseWithError } from '~/utils/promise';
import {
  ACCESS_POST_EDIT,
  ACCESS_POST_DELETE,
  ACCESS_IMAGE_UPLOAD,
  ACCESS_GIT_SYNC,
  ADMIN_USER,
} from '~/utils/constants';

const ACCESS_MAP: AccessMap = {
  [ADMIN_USER]: [
    ACCESS_POST_EDIT,
    ACCESS_POST_DELETE,
    ACCESS_IMAGE_UPLOAD,
    ACCESS_GIT_SYNC,
  ],
};
export default class UserController {
  cryptoPassword(password: string) {
    return sha3(password, { outputLength: 256 }).toString();
  }

  validator(username: string, password: string) {
    const isPassed = userFormValidator(username, password);
    if (isPassed !== true) {
      return formatResponse(422, null, isPassed);
    }

    return isPassed;
  }

  getUser(condition: UserQueryConditions) {
    return prisma.user.findUnique({
      where: condition,
      select: {
        username: true,
        id: true,
        passwordDigest: true,
        access: true,
      },
    });
  }

  createRow(username: string, password: string) {
    return prisma.user.create({
      data: {
        username,
        passwordDigest: this.cryptoPassword(password),
        access: ACCESS_MAP[username] || [],
      },
    });
  }

  async signIn(condition: UserQueryConditions, password?: string) {
    const [user, error] = await promiseWithError(this.getUser(condition));
    if (error) {
      return Promise.reject(formatResponse(500, error, error.message));
    }

    if (!user) {
      return Promise.reject(formatResponse(404, null, '用户不存在'));
    }

    if (password && this.cryptoPassword(password) !== user.passwordDigest) {
      return Promise.reject(formatResponse(422, null, '用户密码错误'));
    }

    return formatResponse(200, omit(user, ['passwordDigest']), '登录成功');
  }

  async signUp(username: string, password: string) {
    if (username !== ADMIN_USER) {
      return Promise.reject(formatResponse(405, null, '因为备案的原因，不支持注册，EL PSY CONGROO!'));
    }

    const verifiedResult = this.validator(username, password);
    if (verifiedResult !== true) {
      return Promise.reject(verifiedResult);
    }

    const [user, error] = await promiseWithError(this.signIn({ username }, password));
    if (error && error.code !== 404) {
      return Promise.reject(error);
    }

    if (user) {
      return user;
    }

    const [newUser, signUpError] = await promiseWithError(this.createRow(username, password));
    if (signUpError) {
      return Promise.reject(signUpError);
    }

    return formatResponse(200, omit(newUser, ['passwordDigest']), '注册成功');
  }
}

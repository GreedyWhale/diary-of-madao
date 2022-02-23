/*
 * @Description: user 表控制器
 * @Author: MADAO
 * @Date: 2021-09-15 14:46:09
 * @LastEditors: MADAO
 * @LastEditTime: 2022-02-23 19:02:52
 */
import type { UserQueryConditions, AccessMap } from '~/types/controller/user';

import sha3 from 'crypto-js/sha3';
import hex from 'crypto-js/enc-hex';
import { omit } from 'lodash';

import prisma from '~/utils/prisma';
import { formatResponse } from '~/utils/middlewares';
import { promiseWithSettled } from '~/utils/promise';
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
  static crypto(password: string) {
    return hex.stringify(sha3(password));
  }

  async getUser(condition: Partial<{
    id: number;
    username: string;
  }>) {
    const user = await promiseWithSettled(prisma.user.findUnique({
      where: condition,
      include: {
        access: {
          select: {
            access: true,
          },
        },
      },
    }));

    return user;
  }

  async validator(type: 'base' | 'access', payload: Partial<{ username: string; password: string; userId: number; currentAccess: string; }>) {
    if (type === 'base') {
      if (!/^[\w\d]{3,20}$/.test(payload.username || '')) {
        return {
          passed: false,
          message: '用户名格式错误，用户名长度为3～20的字母或数字组成',
        };
      }

      if (!/^[\w\d]{6,15}$/.test(payload.password || '')) {
        return {
          passed: false,
          message: '密码格式错误，密码长度为6～15的字母或数字组成',
        };
      }
    }

    if (type === 'access') {
      const user = await this.getUser({ id: payload.userId || -1 });
      if (user.status === 'rejected') {
        return {
          passed: false,
          message: user.reason,
        };
      }

      const access = await promiseWithSettled(prisma.access.findMany({
        where: {
          users: {
            some: {
              userId: payload.userId || -1,
            },
          },
        },
      }));
      if (access.status === 'rejected') {
        return {
          passed: false,
          message: access.reason,
        };
      }

      const passed = access.value.some(value => value.name === payload.currentAccess);
      if (!passed) {
        return {
          passed,
          message: '权限不足',
        };
      }
    }

    return {
      passed: true,
      message: '验证通过',
    };
  }

  async createUser(username: string, password: string) {
    const access = ACCESS_MAP[username] || [];
    const user = await promiseWithSettled(prisma.user.create({
      data: {
        username,
        passwordDigest: UserController.crypto(password),
        access: {
          create: access.map(value => ({
            assignedBy: username,
            access: {
              connectOrCreate: {
                create: { name: value },
                where: { name: value },
              },
            },
          })),
        },
      },
      include: {
        access: {
          select: {
            access: true,
          },
        },
      },
    }));

    return user;
  }

  async signIn(condition: UserQueryConditions, password?: string) {
    const user = await this.getUser(condition);

    if (user.status === 'rejected') {
      return formatResponse(500, user.reason, user.reason.message || '无法获取用户信息');
    }

    if (!user.value) {
      return formatResponse(404, {}, '用户不存在');
    }

    if (password && UserController.crypto(password) !== user.value.passwordDigest) {
      return formatResponse(422, {}, '用户密码错误');
    }

    return formatResponse(200, omit(user.value, ['passwordDigest']), '登录成功');
  }

  async signUp(username: string, password: string) {
    const handleAccess = () => new Promise((resolve, reject) => {
      if (username !== ADMIN_USER) {
        reject(formatResponse(405, {}, '因为备案的原因，不支持注册，EL PSY CONGROO!'));
        return;
      }

      resolve(true);
    });
    const handleParams = async () => {
      const verifiedResult = await this.validator('base', {
        username,
        password,
      });

      if (!verifiedResult.passed) {
        return Promise.reject(formatResponse(422, {}, verifiedResult.message));
      }

      return true;
    };

    const handleRepeatUser = () => this.getUser({ username }).then(user => {
      if (user.status === 'fulfilled' && user.value) {
        return Promise.reject(formatResponse(422, {}, '用户已存在，请直接登录'));
      }

      return true;
    });
    const createUser = () => this.createUser(username, password).then(user => {
      if (user.status === 'rejected') {
        return Promise.reject(formatResponse(500, user.reason, user.reason.message || '创建用户失败，请稍后重试！'));
      }

      return formatResponse(200, omit(user.value, ['passwordDigest']), '注册成功');
    });

    try {
      await handleAccess();
      await handleParams();
      await handleRepeatUser();
      const user = await createUser();
      return user;
    } catch (error: any) {
      return error;
    }
  }
}

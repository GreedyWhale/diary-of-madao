/*
 * @Description: user model
 * @Author: MADAO
 * @Date: 2022-09-30 11:35:06
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-31 21:23:39
 */
import type { User } from '@prisma/client';
import type { Response } from '~/lib/api';

import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';

import BaseModel from './index';
import { prisma } from '~/lib/db';
import { formatResponse } from '~/lib/api';

export type UserInfo = Pick<User, 'id' | 'username'>;

class UserModel extends BaseModel {
  encryptPassword(password: string) {
    return Base64.stringify(hmacSHA512(password, process.env.USER_PASSWORD_KEY!));
  }

  async create(username: string, password: string) {
    try {
      await this.validator(
        { username, password },
        [
          { key: 'username', message: '用户名格式错误，用户名长度为3～20的字母或数字组成', required: value => /^[\w\d]{3,20}$/.test(value) },
          { key: 'password', message: '密码格式错误，密码长度为6～15的字母或数字组成', required: value => /^[\w\d]{6,15}$/.test(value) },
        ],
      );
      await this.index({ username }).then(user => {
        if (user) {
          return Promise.reject(formatResponse({ status: 403, message: '用户已存在，请直接登录' }));
        }
      });

      return await this.execSql(prisma.user.create({
        data: { username, password: this.encryptPassword(password) },
        select: { username: true, id: true },
      }));
    } catch (error) {
      return error as Promise<Response<UserInfo>>;
    }
  }

  async index(params: Partial<{ id: number; username: string; }>): Promise<Response<UserInfo>> {
    try {
      return await this.execSql(
        prisma.user.findUnique({
          where: params,
          select: { id: true, username: true },
        }),

        user => {
          if (user) {
            return formatResponse({ resource: user });
          }

          return formatResponse({ status: 404 });
        },
      );
    } catch (error) {
      return error as Promise<Response<UserInfo>>;
    }
  }
}

export default UserModel;

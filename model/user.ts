/*
 * @Description: user model
 * @Author: MADAO
 * @Date: 2022-09-30 11:35:06
 * @LastEditors: MADAO
 * @LastEditTime: 2022-09-30 17:54:13
 */
import type { User } from '@prisma/client';
import type { Response } from '~/lib/request';

import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';

import { prisma } from '~/lib/db';
import { formatResponse } from '~/lib/request';
import { validator } from '~/lib/validator';

export type UserInfo = Pick<User, 'id' | 'username'>;

class UserModel {
  constructor(protected username: string, protected password: string) {}

  encryption() {
    return Base64.stringify(hmacSHA512(this.password, process.env.USER_PASSWORD_KEY!));
  }

  async create(): Promise<Response<UserInfo>> {
    try {
      const errors = validator(
        { username: this.username, password: this.password },
        [
          { key: 'username', message: '用户名格式错误，用户名长度为3～20的字母或数字组成', required: value => /^[\w\d]{3,20}$/.test(value) },
          { key: 'password', message: '密码格式错误，密码长度为6～15的字母或数字组成', required: value => /^[\w\d]{6,15}$/.test(value) },
        ],
      );

      if (errors) {
        return formatResponse({ status: 422, errors });
      }

      const user = await prisma.user.findUnique({
        where: { username: this.username },
        select: { username: true, id: true, password: true },
      });
      const password = this.encryption();
      if (user) {
        if (password === user.password) {
          return formatResponse({ resource: { username: user.username, id: user.id } });
        }

        return formatResponse({ status: 401 });
      }

      const newUser = await prisma.user.create({
        data: { username: this.username, password },
        select: { username: true, id: true },
      });

      return formatResponse({ resource: newUser });
    } catch (error) {
      const _error = error as Error;
      return formatResponse({ status: 500, message: _error.message });
    }
  }

  async index(userId?: number): Promise<Response<UserInfo>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true },
      });

      if (user) {
        return formatResponse({ resource: user });
      }

      return formatResponse({ status: 404 });
    } catch (error) {
      const _error = error as Error;
      return formatResponse({ status: 500, message: _error.message });
    }
  }
}

export default UserModel;

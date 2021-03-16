/*
 * @Description: 登录controller
 * @Author: MADAO
 * @Date: 2021-03-16 11:43:45
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-16 15:58:46
 */
import SHA3 from 'crypto-js/sha3';
import getConnection from '~/utils/getConnection';
import { User } from '~/model/entity/User';

class SignInController {
  public username: string;

  public password: string;

  public user: User;

  public async validator() {
    if (!this.username.trim()) {
      return '请填写用户名';
    }
    const user = await (await getConnection()).manager.findOne(User, {
      username: this.username,
    });
    if (!user) {
      return '用户名不存在';
    }
    const passwordDigest = SHA3(this.password, { outputLength: 256 }).toString();
    if (passwordDigest !== user.passwordDigest) {
      return '密码与用户名不匹配';
    }
    this.user = user;
    return true;
  }

  constructor(data: { username: string, password: string }) {
    Object.assign(this, data);
  }
}

export default SignInController;

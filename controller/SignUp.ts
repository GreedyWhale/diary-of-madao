/*
 * @Description: 注册controller
 * @Author: MADAO
 * @Date: 2021-03-16 11:43:45
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-16 15:56:59
 */
import getConnection from '~/utils/getConnection';
import { User } from '~/model/entity/User';

class SignUpController {
  public username: string;

  public password: string;

  public async validator() {
    if (!this.username.trim()) {
      return '用户名不能为空';
    }
    if (!/^[a-zA-Z0-9]{2,15}$/.test(this.username.trim())) {
      return '用户名格式错误，用户名由2～15个英文字母或数字组成';
    }
    const sameUsers = await (await getConnection()).manager.find(User, {
      username: this.username,
    });
    if (sameUsers.length) {
      return '用户名已存在';
    }
    if (!this.password.trim()) {
      return '密码不能为空';
    }
    if (this.password.length < 7) {
      return '密码长度太短，至少需要7位';
    }
    return true;
  }

  constructor(data: { username: string, password: string }) {
    Object.assign(this, data);
  }
}

export default SignUpController;

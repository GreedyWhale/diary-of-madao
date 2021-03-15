import getConnection from './getConnection';
import { User } from '~/src/entity/User';

const validator = async ({ username, password }: {
  username: string; password: string;
}) => {
  if (!username.trim()) {
    return '用户名不能为空';
  }
  if (!/^[a-zA-Z0-9]{2,15}$/.test(username.trim())) {
    return '用户名格式错误，用户名由2～15个英文字母或数字组成';
  }
  const sameUsers = await (await getConnection()).manager.find(User, {
    username,
  });
  if (sameUsers.length) {
    return '用户名已存在';
  }
  if (!password.trim()) {
    return '密码不能为空';
  }
  if (password.length <= 7) {
    return '密码长度太短，至少需要7位';
  }
  return true;
};

export default validator;

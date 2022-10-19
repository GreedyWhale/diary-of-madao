/*
 * @Description: 排除对象中的字段
 * @Author: MADAO
 * @Date: 2022-10-19 21:57:30
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-19 21:58:46
 */

export const exclude = <T, Key extends keyof T>(
  user: T,
  ...keys: Key[]
): Omit<T, Key> => {
  for (const key of keys) {
    delete user[key];
  }

  return user;
};

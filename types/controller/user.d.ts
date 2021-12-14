/*
 * @Description: UserController 类型声明
 * @Author: MADAO
 * @Date: 2021-12-13 16:29:52
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-13 17:08:00
 */

export type UserQueryConditions = Partial<{
  id: number;
  username: string;
}>;

export type AccessMap = Record<string, string[]>;

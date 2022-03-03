/*
 * @Description: Header组件类型声明
 * @Author: MADAO
 * @Date: 2022-03-03 10:20:32
 * @LastEditors: MADAO
 * @LastEditTime: 2022-03-03 12:12:07
 */

export type UserMenuTypes = 'createPost' | 'signOut';
export interface UserMenuProps {
  visible: boolean;
  onHide: (visible: boolean) => void;
}

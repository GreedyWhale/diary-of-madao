/*
 * @Description: SignOutModal 组件类型声明
 * @Author: MADAO
 * @Date: 2021-12-16 17:00:03
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-16 17:01:04
 */
import type { ModalProps } from 'semantic-ui-react';

export type SignOutModalProps = ModalProps & {
  onCancel?: () => void;
  onConfirm?: () => void;
}

/*
 * @Description: Dialog 组件类型声明
 * @Author: MADAO
 * @Date: 2022-01-05 21:43:00
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-05 22:21:36
 */
import type React from 'react';

export interface DialogProps {
  title: string;
  content: string | React.ReactNode;
  actions: React.ReactNode[];
  open: boolean;
  onClose: () => void;
}

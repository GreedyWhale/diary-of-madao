/*
 * @Description: Layout 组件类型声明
 * @Author: MADAO
 * @Date: 2021-12-14 16:23:51
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-05 21:03:07
 */
export interface LayoutProps {
  errorInfo?: {
    errorCode: number;
    errorMessage: string;
  } | null;
}

/*
 * @Description: Layout 组件类型声明
 * @Author: MADAO
 * @Date: 2021-12-16 15:20:58
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-16 16:27:06
 */
export interface LayoutProps {
  errorInfo?: {
    errorCode: number;
    errorMessage: string;
  } | null;
}

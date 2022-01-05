/*
 * @Description: Button 组件类型声明
 * @Author: MADAO
 * @Date: 2022-01-05 21:03:40
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-05 21:03:40
 */
export interface ButtonProps extends ButtonTypeMap {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => Promise<any>;
  loading?: boolean;
  disable?: boolean;
  variant?: 'text' | 'contained' | 'outlined';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
}

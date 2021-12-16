/*
 * @Description: Button 组建类型声明
 * @Author: MADAO
 * @Date: 2021-12-16 15:00:11
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-16 15:13:34
 */
export interface ButtonProps extends ButtonTypeMap {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => Promise<any>;
  loading?: boolean;
  disable?: boolean;
  variant?: 'text' | 'contained' | 'outlined';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
}

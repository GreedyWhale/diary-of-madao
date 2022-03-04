/*
 * @Description: Pagination 组件类型声明
 * @Author: MADAO
 * @Date: 2021-12-16 16:51:42
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-16 16:52:51
 */
import type { API } from '~/types/API';

export type PaginationProps = API.BasePagination & {
  onClick: (_currentPage: number) => void;
  maxRenderItems: number;
  step: number;
}

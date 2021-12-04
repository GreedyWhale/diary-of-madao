/* eslint-disable no-unused-vars */
/*
 * @Description: 接口相关类型声明
 * @Author: MADAO
 * @Date: 2021-09-23 16:57:42
 * @LastEditors: MADAO
 * @LastEditTime: 2021-09-23 18:03:26
 */

export module API {
  type BasePagination = Record<'pageSize' | 'currentPage' | 'total', number>;
  interface BaseListResult<T> {
    list: T[];
    pagination: BasePagination;
  }
}

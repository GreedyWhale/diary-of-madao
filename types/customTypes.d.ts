/* eslint-disable no-unused-vars */
/*
 * @Description: 自定义的类型
 * @Author: MADAO
 * @Date: 2021-09-04 10:52:12
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-04 12:18:22
 */

declare type AsyncReturnType<T> = ReturnType<T> extends Promise<infer U> ? U: never;


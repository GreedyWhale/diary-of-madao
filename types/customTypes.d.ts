/*
 * @Description: 自定义的类型
 * @Author: MADAO
 * @Date: 2021-09-04 10:52:12
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-14 11:17:00
 */

declare type AsyncReturnType<T> = ReturnType<T> extends Promise<infer U> ? U: never;


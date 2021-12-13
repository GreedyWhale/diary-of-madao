/*
 * @Description: promise方法扩展
 * @Author: MADAO
 * @Date: 2021-09-24 09:57:33
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-13 16:17:35
 */

/**
 * @param {Promise}
 * @returns [data, null]
 * @returns [null, error]
 */
export const promiseWithError = <T>(promiseInstance: Promise<T>): Promise<[T, null] | [null, any]> => promiseInstance
  .then(result => ([result, null] as [T, null]))
  .catch(error => ([null, error] as [null, any]));


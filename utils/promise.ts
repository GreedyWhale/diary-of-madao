/*
 * @Description: promise方法扩展
 * @Author: MADAO
 * @Date: 2021-09-24 09:57:33
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-27 14:22:37
 */

/**
 * @param {Promise}
 * @returns [data, null]
 * @returns [null, error]
 */
export const promiseWithError = <T>(promiseInstance: Promise<T>): Promise<[T, null] | [null, any]> => promiseInstance
  .then(result => ([result, null] as [T, null]))
  .catch(error => ([null, error] as [null, any]));

export const promiseWithSettled = <T>(promiseInstance: Promise<T>) => promiseInstance
  /*
   * 这里ts的写法很奇怪，我目前还想不到好的写法，
   * ts总是把status推导成string，所以这里用as强制转换类型
   */
  .then(result => ({ value: result, status: 'fulfilled' as 'fulfilled' }))
  .catch(error => ({ reason: error, status: 'rejected' as 'rejected' }));


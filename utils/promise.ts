/*
 * @Description: promise方法扩展
 * @Author: MADAO
 * @Date: 2021-09-24 09:57:33
 * @LastEditors: MADAO
 * @LastEditTime: 2021-09-25 17:46:52
 */

/**
 * @param {Promise}
 * @returns [data, null]
 * @returns [null, error]
 */
export const promiseSettled = <T>(promise: Promise<T>): Promise<T[] | [null, any]> => {
  return promise
    .then(result => ([result, null]))
    .catch(error => ([null, error]));
};

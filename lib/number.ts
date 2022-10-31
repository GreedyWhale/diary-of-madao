/*
 * @Description: 数字相关方法
 * @Author: MADAO
 * @Date: 2022-10-31 17:28:20
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-31 17:53:21
 */
export const getNumberFromString = <T>(number: T, defaultNumber?: number) => {
  if (typeof number === 'string') {
    const safeNumber = parseInt(number, 10);
    if (!Number.isNaN(safeNumber)) {
      return safeNumber;
    }
  }

  if (typeof number === 'number') {
    return number;
  }

  return defaultNumber ?? NaN;
};

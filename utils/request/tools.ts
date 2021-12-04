/*
 * @Description: 请求相关的方法
 * @Author: MADAO
 * @Date: 2021-07-28 10:31:34
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-04 12:21:58
 */

export interface ResponseJson<T = Record<string, any> | null> {
  code: number;
  data: T;
  message: string;
}

const messages = {
  200: '请求成功',
  404: '未找到相关资源',
  405: '请求方法不允许',
  422: '请求参数，请检查后重试',
  500: '服务器出错',
};

export const formatResponse = <T>(code: keyof typeof messages, data?: T, message?: string): ResponseJson<T> => ({
  code,
  data: data || null as any,
  message: message || messages[code],
});


/*
 * @Description: 请求相关的方法
 * @Author: MADAO
 * @Date: 2021-07-28 10:31:34
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-13 15:57:48
 */
import type { FormatResponse, ResponseMessageMap } from '~/types/requestTools';

const messages: ResponseMessageMap = {
  200: '请求成功',
  204: 'No Content',
  401: '用户认证失败',
  403: '权限不足',
  404: '未找到相关资源',
  405: '请求方法不允许',
  422: '请求参数，请检查后重试',
  500: '服务器出错',
};

export const formatResponse: FormatResponse = (code, data?, message?) => ({
  code,
  data: data || (null as any),
  message: message || messages[code],
});


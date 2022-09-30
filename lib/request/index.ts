/* eslint-disable @typescript-eslint/naming-convention */
/*
 * @Description: 请求相关方法
 * @Author: MADAO
 * @Date: 2022-09-30 12:28:32
 * @LastEditors: MADAO
 * @LastEditTime: 2022-09-30 17:47:51
 */
export type Response<T = Record<string, any>> = {
  resource?: T;
  status: number;
  message: string;
  errors?: Record<string, string[]>;
};

const responseMessageMap: Record<string, string> = {
  200: 'ok',
  401: 'Unauthorized',
  404: 'Not Found',
  405: 'Method Not Allowed',
};

export const formatResponse = <T extends Record<string, any>>(params: Partial<Response<T>>): Response<T> => {
  const status = params.status ?? 200;

  return {
    resource: params.resource,
    status,
    message: params.message ? params.message : responseMessageMap[status],
    errors: params.errors,
  };
};

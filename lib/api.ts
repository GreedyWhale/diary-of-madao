/*
 * @Description: 接口相关方法
 * @Author: MADAO
 * @Date: 2022-10-22 10:46:14
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-31 17:50:08
 */
export type Response<T> = {
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

export const formatResponse = <T>(params: Partial<Response<T>>): Response<T> => {
  const status = params.status ?? 200;

  return {
    resource: params.resource,
    status,
    message: params.message ? params.message : responseMessageMap[status],
    errors: params.errors,
  };
};


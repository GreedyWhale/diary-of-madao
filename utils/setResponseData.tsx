import { NextApiResponse } from 'next';

const errorMap: {[key: string ]: string} = {
  200: '请求成功',
  400: '请求异常',
  405: '请求方法错误',
  422: '请求提交的数据错误',
};
const customizableMessage: {[key: string ]: string} = {
  400001: '缺失用户名',
  400002: '缺失密码',
};

export default function setResponseData(
  this: NextApiResponse,
  httpStatusCode: number,
  data: {[key: string]: any} | null,
  customizableCode?: number,
  message?: string,
) {
  this.status(httpStatusCode);
  this.json({
    code: customizableCode || httpStatusCode,
    message: message || (customizableCode ? customizableMessage[customizableCode] : errorMap[httpStatusCode]),
    data,
  });
}

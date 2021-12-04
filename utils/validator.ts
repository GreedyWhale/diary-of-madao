/*
 * @Description: 验证数据相关方法
 * @Author: MADAO
 * @Date: 2021-08-09 22:34:07
 * @LastEditors: MADAO
 * @LastEditTime: 2021-09-25 18:41:25
 */
import type { PostData, CreatePostParams } from '~/controller/post';

// eslint-disable-next-line no-unused-vars
const postDataErrors: {[key in keyof PostData]: string} = {
  title: '文章标题不能为空',
  content: '文章内容不能为空',
  introduction: '文章简介不能为空'
};

const regexps = {
  username: /^[\w\d]{3,20}$/,
  password: /^[\w\d]{6,15}$/
};

export const postValidator = (postData: CreatePostParams) => {
  const { labels, ...rest } = postData;
  if (!labels.length) {
    return '请至少设置一个文章标签';
  }

  let errorMessage = '';
  Object.keys(rest).every(key => {
    if (!postData[key]) {
      errorMessage = postDataErrors[key];
      return false;
    }

    return true;
  });

  return errorMessage || true;
};

export const userFormValidator = (username: string, password: string) => {
  if (!regexps.username.test(username)) {
    return '用户名格式错误';
  }

  if (!regexps.password.test(password)) {
    return '密码格式错误';
  }

  return true;
};


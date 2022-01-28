/*
 * @Description: 验证数据相关方法
 * @Author: MADAO
 * @Date: 2021-08-09 22:34:07
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-27 14:41:37
 */
import type { PostData, CreatePostParams } from '~/types/controller/post';

// eslint-disable-next-line no-unused-vars
const postDataErrors: {[key in keyof PostData]: string} = {
  title: '文章标题不能为空',
  content: '文章内容不能为空',
  introduction: '文章简介不能为空',
};

export const postValidator = (postData: CreatePostParams) => {
  const { labels, ...rest } = postData;
  if (!labels.length) {
    return '请至少设置一个文章标签';
  }

  let errorMessage = '';
  Object.keys(rest).every(key => {
    if (!postData[key as keyof PostData]) {
      errorMessage = postDataErrors[key as keyof PostData];
      return false;
    }

    return true;
  });

  return errorMessage || true;
};

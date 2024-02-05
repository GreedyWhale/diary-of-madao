/*
 * @Description: 页面 url 相关方法
 * @Author: MADAO
 * @Date: 2024-02-05 11:31:21
 * @LastEditors: MADAO
 * @LastEditTime: 2024-02-05 11:36:26
 */
export const getSearchParams = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  return params;
};

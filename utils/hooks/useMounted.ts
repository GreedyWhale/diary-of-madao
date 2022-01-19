/*
 * @Description: 用于检测组件是否已卸载
 * @Author: MADAO
 * @Date: 2022-01-05 22:36:28
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-19 18:12:31
 */
import React from 'react';

export default function useMounted() {
  const mounted = React.useRef(false);

  React.useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  return mounted;
}

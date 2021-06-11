/*
 * @Author: MADAO
 * @Date: 2021-06-10 15:46:14
 * @LastEditors: MADAO
 * @LastEditTime: 2021-06-11 11:31:40
 * @Description: 入口文件
 */
import type {AppProps} from 'next/app';
import 'styles/globals.scss';

function MyApp({Component, pageProps}: AppProps) {
	return <Component {...pageProps} />;
}

export default MyApp;

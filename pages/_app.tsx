/*
 * @Author: MADAO
 * @Date: 2021-06-10 15:46:14
 * @LastEditors: MADAO
 * @LastEditTime: 2021-06-11 18:10:28
 * @Description: 入口文件
 */
import type {AppProps} from 'next/app';
import Head from 'next/head';
import '~/styles/globals.scss';
import styles from '~/styles/layout.module.scss';

function MyApp({Component, pageProps}: AppProps) {
	return (
		<>
			<Head>
				<title>MADAO观察日记</title>
				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="manifest" href="/site.webmanifest" />
				<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#f05454" />
				<meta name="msapplication-TileColor" content="#f05454" />
				<meta name="theme-color" content="#f05454" />
			</Head>
			<main className={styles.layout} data-theme="purple">
				<div className={styles.header}>
					<h1 className={styles.title}>
						<a href="/">MADAO观察日记</a>
					</h1>
					<div className={styles.dividingLine} />
				</div>
				<Component {...pageProps} />
			</main>
		</>
	);
}

export default MyApp;

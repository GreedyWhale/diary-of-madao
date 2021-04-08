/*
 * @Description: 监听model文件夹变化, 重新执行webpack
 * @Author: MADAO
 * @Date: 2021-04-08 15:16:46
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 15:27:14
 */
// eslint-disable-next-line import/no-extraneous-dependencies
const chokidar = require('chokidar');
const { join } = require('path');
const { spawn } = require('child_process');

chokidar
  .watch(join(__dirname, '../model'), { awaitWriteFinish: true })
  .on('all', () => {
    const process = spawn('yarn build:orm', { shell: true });
    process.stderr.on('data', (error) => {
      console.error('yarn build:orm', error.toString());
    });
  });

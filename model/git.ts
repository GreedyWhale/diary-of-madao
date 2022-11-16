/*
 * @Description: 提交至github的接口
 * @Author: MADAO
 * @Date: 2022-10-22 16:01:23
 * @LastEditors: MADAO
 * @LastEditTime: 2022-11-16 22:55:01
 */
import simpleGit from 'simple-git';
import path from 'path';

import { formatResponse } from '~/lib/api';

class GitModel {
  git = simpleGit();
  async syncToGitHub() {
    return this.git
      .addConfig('user.name', 'Caisr')
      .addConfig('user.email', 'madaocai@gmail.com')
      .add([
        path.join(process.cwd(), './public/upload'),
        path.join(process.cwd(), './public/notes'),
      ])
      .commit('update：更新笔记相关文件')
      .pull('origin', 'main')
      .push(['origin', 'main'])
      .then(
        () => formatResponse({ status: 200, message: '同步完成' }),
        error => formatResponse({ status: 500, message: (error as Error).message }),
      );
  }
}

export default GitModel;

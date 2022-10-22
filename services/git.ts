/*
 * @Description: 同步至github
 * @Author: MADAO
 * @Date: 2022-10-22 16:20:25
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-22 16:21:29
 */
import request from '~/lib/request';

import { apiGit } from './api';

export const syncToGithub = async () => request.put(apiGit);

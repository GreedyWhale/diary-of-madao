/*
 * @Description: 同步static目录至github
 * @Author: MADAO
 * @Date: 2021-10-14 16:36:01
 * @LastEditors: MADAO
 * @LastEditTime: 2021-10-14 16:51:41
 */
import request from '~/utils/request';
import { apiGit } from './api';

export const syncToGithub = () => request.post(apiGit);

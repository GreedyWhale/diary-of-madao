/*
 * @Description: 同步static目录至github
 * @Author: MADAO
 * @Date: 2021-10-14 16:36:01
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-28 13:03:34
 */
import request from '~/utils/request';
import { apiGit } from './api';

export const syncToGithub = () => request.put(apiGit);

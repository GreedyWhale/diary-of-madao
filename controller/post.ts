/*
 * @Description: Post 表控制器
 * @Author: MADAO
 * @Date: 2021-09-15 12:00:19
 * @LastEditors: MADAO
 * @LastEditTime: 2021-12-13 18:04:31
 */
import type { Post } from '@prisma/client';
import type { GetPostsParams, GetPostsResponse } from '~/services/post';
import type { ResponseData } from '~/types/requestTools';
import type { CreatePostParams } from '~/types/postController';

import fsPromises from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

import prisma from '~/utils/prisma';
import { formatResponse } from '~/utils/request/tools';
import { ACCESS_POST_EDIT, ACCESS_POST_DELETE } from '~/utils/constants';
import { postValidator } from '~/utils/validator';
import { promiseWithError } from '~/utils/promise';

export default class PostController {
  async storageToLocal(userId: number, postData: CreatePostParams) {
    const postsDir = path.join(process.cwd(), `/static/posts/${userId}`);

    if (!existsSync(postsDir)) {
      const error = await fsPromises.mkdir(postsDir).catch(error => error);
      if (error) {
        return Promise.reject(formatResponse(500, error, error.message));
      }
    }

    return fsPromises.writeFile(
      path.join(postsDir, `${postData.title}.md`),
      postData.content,
    )
      .then(() => true)
      .catch(error => Promise.reject(formatResponse(500, error, error.message)));
  }

  async getUser(id: number) {
    if (!id) {
      return Promise.reject(formatResponse(401, null, '请先登录'));
    }

    const [user, error] = await promiseWithError(prisma.user.findUnique({ where: { id } }));

    if (error) {
      Promise.reject(formatResponse(500, error, error.message));
    }

    if (!user) {
      Promise.reject(formatResponse(403, null, '用户不存在'));
    }

    return user;
  }

  async updatePost(userId: number, postData: CreatePostParams, postId: number = -1): Promise<ResponseData<Post | null>> {
    const [user, error] = await promiseWithError(this.getUser(userId));
    if (error || !user) {
      return error;
    }

    if (!(user.access.includes(ACCESS_POST_EDIT))) {
      return formatResponse(403, null, '权限不足');
    }

    const verifiedResult = postValidator(postData);
    if (verifiedResult !== true) {
      return formatResponse(422, null, verifiedResult);
    }

    const { labels, ...rest } = postData;
    const [post, postError] = await promiseWithError(prisma.post.upsert({
      where: { id: postId },
      create: {
        ...rest,
        author: {
          connect: {
            id: user.id,
          },
        },
        labels: {
          create: labels.map(label => ({
            assignedBy: user.username,
            label: {
              connectOrCreate: {
                where: { name: label.name },
                create: { name: label.name },
              },
            },
          })),
        },
      },
      update: {
        ...rest,
        author: {
          connect: {
            id: user.id,
          },
        },
        labels: {
          delete: labels.filter(label => label.action === 'delete').map(label => ({
            postId_labelId: {
              postId,
              labelId: label.id!,
            },
          })),
          create: labels.filter(label => label.action === 'add').map(label => ({
            assignedBy: user.username,
            label: {
              connectOrCreate: {
                where: { name: label.name },
                create: { name: label.name },
              },
            },
          })),
        },
      },
    }));

    if (postError) {
      return formatResponse(500, postError, postError.message);
    }

    const storageError = (await promiseWithError(this.storageToLocal(user.id, postData)))[1];
    if (storageError) {
      return storageError;
    }

    return formatResponse(200, post, postId ? '更新成功' : '发布成功');
  }

  async getPosts(params: GetPostsParams): Promise<ResponseData<GetPostsResponse>> {
    const [data, error] = await promiseWithError(prisma.$transaction([
      prisma.post.findMany({
        skip: params.page === 1 ? 0 : params.page * params.pageSize,
        take: params.pageSize,
        where: params.labelId
          ? {
            labels: {
              every: { labelId: params.labelId },
            },
          }
          : {},
        include: {
          author: {
            select: { username: true },
          },
          labels: {
            select: { label: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.post.count(),
    ]));

    if (error || !data) {
      return formatResponse(500, error, (error || {}).message);
    }

    return formatResponse(200, {
      list: data[0],
      pagination: {
        pageSize: params.pageSize,
        currentPage: params.page,
        total: data[1],
      },
    });
  }

  async getPostDetail(id: number) {
    const [data, error] = await promiseWithError(prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        labels: {
          select: {
            label: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    }));

    if (error) {
      return formatResponse(500, error, error.message);
    }

    return formatResponse(200, data);
  }

  async deletePost(userId: number, id: number) {
    const [user, userError] = await promiseWithError(this.getUser(userId));
    if (userError || !user) {
      return userError || formatResponse(500, null, '获取用户信息失败');
    }

    if (!(user.access.includes(ACCESS_POST_DELETE))) {
      return formatResponse(403, null, '权限不足');
    }

    const [data, error] = await promiseWithError(prisma.post.delete({
      where: { id },
    }));

    if (error) {
      return formatResponse(500, error, error.message);
    }

    return formatResponse(200, data, '删除成功');
  }
}

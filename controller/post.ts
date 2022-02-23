/*
 * @Description: Post 表控制器
 * @Author: MADAO
 * @Date: 2021-09-15 12:00:19
 * @LastEditors: MADAO
 * @LastEditTime: 2022-02-23 15:03:53
 */
import type { GetPostsParams, GetPostsResponse } from '~/types/services/post';
import type { API } from '~/types/API';
import type { CreatePostParams, PostData } from '~/types/controller/post';
import type { Post, User } from '@prisma/client';

import fsPromises from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

import prisma from '~/utils/prisma';
import { formatResponse } from '~/utils/middlewares';
import { ACCESS_POST_EDIT, ACCESS_POST_DELETE } from '~/utils/constants';
import { promiseWithSettled } from '~/utils/promise';

import UserController from './user';

const userController = new UserController();
export default class PostController {
  static validator(postData: CreatePostParams) {
    const postDataErrors = {
      title: '文章标题不能为空',
      content: '文章内容不能为空',
      introduction: '文章简介不能为空',
    };
    const { labels, ...rest } = postData;
    if (!labels.length) {
      return '请至少设置一个文章标签';
    }

    let errorMessage = '';
    Object.keys(rest).every(key => {
      if (!postData[key as keyof PostData]) {
        errorMessage = postDataErrors[key as keyof PostData];
        return false;
      }

      return true;
    });

    return errorMessage || true;
  }

  async getDetail(id: number) {
    const postDetail = await promiseWithSettled(prisma.post.findUnique({
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

    return postDetail;
  }

  async storageToLocal(userId: number, postData: CreatePostParams) {
    const postsDir = path.join(process.cwd(), `/static/posts/${userId}`);

    if (!existsSync(postsDir)) {
      const error = await fsPromises.mkdir(postsDir).catch(error => error);
      if (error) {
        return {
          succeed: false,
          data: error,
        };
      }
    }

    return fsPromises.writeFile(
      path.join(postsDir, `${postData.title}.md`),
      postData.content,
    )
      .then(() => ({ succeed: true, data: {} }))
      .catch(error => ({ succeed: false, data: error }));
  }

  async updatePost(userId: number, postData: CreatePostParams, postId: number = -1): Promise<API.ResponseData<Post>> {
    const handleUser = () => userController.getUser({ id: userId }).then(user => {
      if (user.status === 'rejected') {
        return Promise.reject(formatResponse(500, user.reason, user.reason.message || '获取用户失败'));
      }

      if (!user.value) {
        return Promise.reject(formatResponse(404, {}, '用户不存在'));
      }

      return user.value;
    });

    const handleAccess = (user: User) => new Promise((resolve, reject) => {
      const verifiedResult = UserController.validator('access', {
        currentAccess: ACCESS_POST_EDIT,
        access: user.access,
      });

      if (!verifiedResult.passed) {
        reject(formatResponse(403, {}, verifiedResult.message));
        return;
      }

      resolve(true);
    });

    const handleParams = () => new Promise((resolve, reject) => {
      const postVerifiedResult = PostController.validator(postData);

      if (postVerifiedResult !== true) {
        reject(formatResponse(422, {}, postVerifiedResult));
        return;
      }

      resolve(true);
    });

    const handlePost = (user: User) => {
      const { labels, ...rest } = postData;
      return prisma.post.upsert({
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
      })
        .then(post => post)
        .catch(error => Promise.reject(formatResponse(500, error, error.message)));
    };

    const handleStorageToLocal = (user: User) => this.storageToLocal(user.id, postData)
      .then(result => {
        if (!result.succeed) {
          return Promise.reject(formatResponse(500, result.data, result.data.message));
        }
      });

    try {
      const user = await handleUser();
      await handleAccess(user);
      await handleParams();
      const post = await handlePost(user);
      await handleStorageToLocal(user);
      return formatResponse(200, post, postId ? '更新成功' : '发布成功');
    } catch (error: any) {
      return error;
    }
  }

  async getPosts(params: GetPostsParams): Promise<API.ResponseData<GetPostsResponse>> {
    const post = await promiseWithSettled(prisma.$transaction([
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

    if (post.status === 'rejected') {
      return formatResponse(500, post.reason, post.reason.message);
    }

    return formatResponse(200, {
      list: post.value[0],
      pagination: {
        pageSize: params.pageSize,
        currentPage: params.page,
        total: post.value[1],
      },
    });
  }

  async deletePost(userId: number, id: number): Promise<API.ResponseData<{}>> {
    const handleUser = () => userController.getUser({ id: userId }).then(user => {
      if (user.status === 'rejected') {
        return Promise.reject(formatResponse(500, user.reason, user.reason.message || '获取用户失败'));
      }

      if (!user.value) {
        return Promise.reject(formatResponse(500, {}, '获取用户不存在'));
      }

      return user.value;
    });

    const handleAccess = (user: User) => new Promise((resolve, reject) => {
      const verifiedResult = UserController.validator('access', {
        currentAccess: ACCESS_POST_DELETE,
        access: user.access,
      });

      if (!verifiedResult.passed) {
        reject(formatResponse(403, {}, verifiedResult.message));
        return;
      }

      resolve(true);
    });

    const handlePost = () => prisma.post.delete({ where: { id } })
      .then(post => post)
      .catch(error => Promise.reject(formatResponse(500, error, error.message)));

    const handleLabels = () => prisma
      .labelsOnPosts
      .findMany()
      .then(labelsOnPost => prisma.label.deleteMany({
        where: {
          id: { notIn: labelsOnPost.map(value => value.labelId) },
        },
      }))
      .catch(error => Promise.reject(formatResponse(500, error, error.message)));

    try {
      const user = await handleUser();
      await handleAccess(user);
      await handlePost();
      await handleLabels();
      return formatResponse(200, {}, '删除成功');
    } catch (error: any) {
      return error;
    }
  }
}

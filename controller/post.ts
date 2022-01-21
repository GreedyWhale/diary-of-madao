/*
 * @Description: Post 表控制器
 * @Author: MADAO
 * @Date: 2021-09-15 12:00:19
 * @LastEditors: MADAO
 * @LastEditTime: 2022-01-21 15:56:15
 */
import type { GetPostsParams, GetPostsResponse } from '~/types/services/post';
import type { API } from '~/types/API';
import type { CreatePostParams } from '~/types/controller/post';

import fsPromises from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

import prisma from '~/utils/prisma';
import { formatResponse } from '~/utils/request/tools';
import { ACCESS_POST_EDIT, ACCESS_POST_DELETE } from '~/utils/constants';
import { postValidator } from '~/utils/validator';
import { promiseWithError } from '~/utils/promise';

import UserController from './user';

const userController = new UserController();
export default class PostController {
  getDetail(id: number) {
    return prisma.post.findUnique({
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
    });
  }

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

  async updatePost(userId: number, postData: CreatePostParams, postId: number = -1) {
    try {
      await userController.permissionValidator(userId, ACCESS_POST_EDIT);
      const user = await userController.getUser({ id: userId });
      const verifiedResult = postValidator(postData);
      if (verifiedResult !== true) {
        return formatResponse(422, null, verifiedResult);
      }

      const { labels, ...rest } = postData;
      const post = await prisma.post.upsert({
        where: { id: postId },
        create: {
          ...rest,
          author: {
            connect: {
              id: user!.id,
            },
          },
          labels: {
            create: labels.map(label => ({
              assignedBy: user!.username,
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
              id: user!.id,
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
              assignedBy: user!.username,
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
        .then(result => result)
        .catch(error => Promise.reject(formatResponse(500, error, error.message)));

      await this.storageToLocal(user!.id, postData);

      return formatResponse(200, post, postId ? '更新成功' : '发布成功');
    } catch (error) {
      return error;
    }
  }

  async getPosts(params: GetPostsParams): Promise<API.ResponseData<GetPostsResponse>> {
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

  async deletePost(userId: number, id: number) {
    try {
      await userController.permissionValidator(userId, ACCESS_POST_DELETE);
      const label = await this.getDetail(id).then(
        detail => {
          if (detail) {
            return detail.labels.map(value => value.label.id);
          }

          return [];
        },
        error => Promise.reject(formatResponse(500, error, error.message)),
      );

      const data = await prisma
        .post
        .delete({ where: { id } })
        .catch(error => Promise.reject(formatResponse(500, error, error.message)));

      if (label.length) {
        const labelsOnPosts = await prisma
          .labelsOnPosts
          .findMany()
          .catch(error => Promise.reject(formatResponse(500, error, error.message)));

        await prisma.label.deleteMany({
          where: {
            id: { notIn: labelsOnPosts.map(value => value.labelId) },
          },
        });
      }

      return formatResponse(200, data, '删除成功');
    } catch (error) {
      return error;
    }
  }
}

/*
 * @Description: Post 表控制器
 * @Author: MADAO
 * @Date: 2021-09-15 12:00:19
 * @LastEditors: MADAO
 * @LastEditTime: 2021-10-16 11:43:18
 */
import type { Post, User } from '@prisma/client';
import type { GetPostsParams, GetPostsResponse } from '~/services/post';
import type { ResponseJson } from '~/utils/request/tools';

import fsPromises from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

import prisma from '~/utils/prisma';
import { formatResponse } from '~/utils/request/tools';
import { ACCESS_POST_EDIT, ACCESS_POST_DELETE } from '~/utils/constants';
import { postValidator } from '~/utils/validator';
import { promiseSettled } from '~/utils/promise';

export type PostData = Pick<Post, 'title' | 'content' | 'introduction'>;
export type RequestLabels = {
  name: string;
  id?: number;
  action: 'add' | 'delete' | 'unchanged';
}[];
export interface CreatePostParams extends PostData {
  labels: RequestLabels;
}

const postController = {
  getUser(userId: number) {
    if (!userId) {
      return Promise.reject(formatResponse(401, null, '请先登录'));
    }

    return prisma.user.findUnique({
      where: {
        id: userId
      }
    })
      .then(user => {
        if (!user) {
          return Promise.reject(formatResponse(401, null, '用户不存在'));
        }

        return user;
      })
      .catch(error => Promise.reject(formatResponse(500, error, error.message)));
  },
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
      postData.content
    )
      .then(() => true)
      .catch(error => Promise.reject(formatResponse(500, error, error.message)));
  },
  getCreatePostParams(user: User, postData: CreatePostParams) {
    const { labels, ...rest } = postData;

    return {
      data: {
        ...rest,
        author: {
          connect: {
            id: user.id
          }
        },
        labels: {
          create: labels.map(label => ({
            assignedBy: user.username,
            label: {
              connectOrCreate: {
                where: { name: label },
                create: { name: label }
              }
            }
          }))
        }
      },
      include: {
        author: {
          select: {
            username: true,
            id: true
          }
        },
        labels: {
          select: {
            labelId: true
          }
        }
      }
    };
  },
  async updatePost(userId: number, postData: CreatePostParams, postId?: number): Promise<ResponseJson<Post>> {
    const [user, userError] = await promiseSettled(postController.getUser(userId));
    if (userError) {
      return userError;
    }

    if (!user.access.includes(ACCESS_POST_EDIT)) {
      return formatResponse(403, null, '权限不足');
    }

    const isPassed = postValidator(postData);
    if (isPassed !== true) {
      return formatResponse(422, null, isPassed);
    }

    const { labels, ...rest } = postData;
    const [post, postError] = await promiseSettled(prisma.post.upsert({
      where: { id: postId || -1 },
      create: {
        ...rest,
        author: {
          connect: {
            id: user.id
          }
        },
        labels: {
          create: labels.map(label => ({
            assignedBy: user.username,
            label: {
              connectOrCreate: {
                where: { name: label.name },
                create: { name: label.name }
              }
            }
          }))
        }
      },
      update: {
        ...rest,
        author: {
          connect: {
            id: user.id
          }
        },
        labels: {
          delete: labels.filter(label => label.action === 'delete').map(label => ({
            // eslint-disable-next-line camelcase
            postId_labelId: {
              postId,
              labelId: label.id
            }
          })),
          create: labels.filter(label => label.action === 'add').map(label => ({
            assignedBy: user.username,
            label: {
              connectOrCreate: {
                where: { name: label.name },
                create: { name: label.name }
              }
            }
          }))
        }
      }
    }));
    if (postError) {
      return formatResponse(500, postError, postError.message);
    }

    const storageError = await promiseSettled(postController.storageToLocal(user.id, postData))[1];
    if (storageError) {
      return storageError;
    }

    return formatResponse(200, post, postId ? '更新成功' : '发布成功');
  },
  async getPosts(params: GetPostsParams): Promise<ResponseJson<GetPostsResponse>> {
    const [data, error] = await promiseSettled(prisma.$transaction([
      prisma.post.findMany({
        skip: params.page === 1 ? 0 : params.page * params.pageSize,
        take: params.pageSize,
        where: params.labelId
          ? {
            labels: {
              every: { labelId: params.labelId }
            }
          }
          : {},
        include: {
          author: {
            select: { username: true }
          },
          labels: {
            select: { label: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.post.count()
    ]));

    if (error) {
      return error;
    }

    return formatResponse(200, {
      list: data[0],
      pagination: {
        pageSize: params.pageSize,
        currentPage: params.page,
        total: data[1]
      }
    });
  },
  async getPostDetail(id: number) {
    const [data, error] = await promiseSettled(prisma.post.findUnique({
      where: {
        id
      },
      include: {
        labels: {
          select: {
            label: true
          }
        },
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    }));

    if (error) {
      return formatResponse(500, error, error.message);
    }

    return formatResponse(200, data);
  },
  async deletePost(userId: number, id: number) {
    const [user, userError] = await promiseSettled(postController.getUser(userId));
    if (userError) {
      return userError;
    }

    if (!user.access.includes(ACCESS_POST_DELETE)) {
      return formatResponse(403, null, '权限不足');
    }

    const [data, error] = await promiseSettled(prisma.post.delete({
      where: {
        id
      }
    }));

    if (error) {
      return formatResponse(500, error, error.message);
    }

    return formatResponse(200, data, '删除成功');
  }
};
export default postController;

/*
 * @Description: label 表控制器
 * @Author: MADAO
 * @Date: 2022-03-08 12:06:19
 * @LastEditors: MADAO
 * @LastEditTime: 2022-03-08 16:06:44
 */
import prisma from '~/utils/prisma';
import { formatResponse } from '~/utils/middlewares';

export default class LabelController {
  async getLabels() {
    const result = await prisma.label.findMany({
      include: {
        posts: {
          select: { postId: true },
        },
      },
    })
      .then(labels => {
        const formattedLabels = labels.map(label => ({
          ...label,
          posts: label.posts.map(post => post.postId),
        }));

        return formatResponse(200, formattedLabels);
      })
      .catch(error => formatResponse(500, error, error.message));

    return result;
  }
}


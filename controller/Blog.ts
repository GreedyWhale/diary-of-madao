/*
 * @Description: 博客controller
 * @Author: MADAO
 * @Date: 2021-03-19 16:28:48
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-19 22:20:42
 */
import getConnection from '~/utils/getConnection';
import { User } from '~/model/entity/User';
import { Blog } from '~/model/entity/Blog';

class BlogController {
  public title: string;

  public content: string;

  public authorId: string;

  private author: User;

  public async validator() {
    if (!this.title) {
      return '博客标题不能为空';
    }
    if (!this.content) {
      return '博客内容不能为空';
    }
    if (!this.authorId) {
      return '用户Id为空';
    }
    const author = await (await getConnection())
      .manager
      .findOne(User, { id: parseInt(this.authorId, 10) });
    if (!author) {
      return '用户信息不匹配';
    }
    this.author = author;
    return true;
  }

  public async create() {
    const blog = new Blog({
      title: this.title,
      content: this.content,
      author: this.author,
    });
    const result = await (await getConnection())
      .manager
      .save(blog);
    return result;
  }

  constructor(data: { title: string, content: string, authorId: string }) {
    Object.assign(this, data);
  }
}

export default BlogController;

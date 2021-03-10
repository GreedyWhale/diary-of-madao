/*
 * @Description: 填充数据
 * @Author: MADAO
 * @Date: 2021-03-08 15:22:09
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-10 11:27:55
 */

import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { User } from './entity/User';
import { Blog } from './entity/Blog';
import { Comment } from './entity/Comment';

createConnection().then(async (connection) => {
  const user = new User({
    username: 'MADAO',
    passwordDigest: Math.random().toString(16),
  });
  const blog = new Blog({
    title: '我的第一篇博客',
    content: '写点什么好呢？',
    author: user,
  });
  const comment = new Comment({
    content: '我也不知道写点什么好',
    user,
    blog,
  });
  await connection.manager.save(user);
  await connection.manager.save(blog);
  await connection.manager.save(comment);
}).catch((error) => console.log(error));

/*
 * @Description: 填充数据
 * @Author: MADAO
 * @Date: 2021-04-08 16:27:56
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 22:23:49
 */

import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { User } from './entity/User';
import { Post } from './entity/Post';
import { Comment } from './entity/Comment';
import ormconfig from '~/ormconfig';

// @ts-ignore
createConnection({
  ...ormconfig,
  entities: [User, Post, Comment],
}).then(async (connection) => {
  // const user = new User({
  //   username: 'MADAO1',
  //   passwordDigest: Math.random().toString(16),
  // });
  // await connection.manager.save(user);
  // const post = new Post({
  //   title: '1111',
  //   content: '22222222',
  //   classified: '测试',
  //   author: user,
  // });
  // await connection.manager.save(post);
  // const comment = new Comment({
  //   content: '这是一条评论',
  //   user,
  //   post,
  // });
  // await connection.manager.save(comment);
  const users = await connection.manager.find('users', { relations: ['posts'] });
  const posts = await connection.manager.find('posts', { relations: ['author'] });
  const comments = await connection.manager.find('comments', { relations: ['user', 'post'] });
  console.log(users, posts, comments);
}).catch((error) => console.log(error));

/*
 * @Description: users表实体
 * @Author: MADAO
 * @Date: 2021-04-08 16:17:20
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 22:03:06
 */
import {
  Entity,
  Column,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import SHA3 from 'crypto-js/sha3';
import { Base } from './Base';
import { Post } from './Post';
import { Comment } from './Comment';

@Entity('users')
export class User extends Base {
  @Column('varchar')
  username: string;

  @Column('varchar')
  passwordDigest: string;

  @OneToMany(() => Post, (post) => post.author, {
    cascade: true,
  })
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user, {
    cascade: true,
  })
  comments: Comment[];

  @BeforeInsert()
  passwordEncryption() {
    this.passwordDigest = SHA3(this.passwordDigest, {
      outputLength: 256,
    }).toString();
  }

  constructor(data: Partial<User>) {
    super();
    data && Object.assign(this, data);
  }
}

/*
 * @Description: users表关联实体
 * @Author: MADAO
 * @Date: 2021-03-08 14:15:42
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-15 15:54:12
 */
import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import SHA3 from 'crypto-js/sha3';
import { omit } from 'lodash';
import { Blog } from './Blog';
import { Comment } from './Comment';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar')
  username: string;

  @Column('varchar')
  passwordDigest: string;

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp')
  updatedAt: Date;

  @OneToMany(() => Blog, (blog) => blog.author)
  @JoinColumn()
  blogs: Blog[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @BeforeInsert()
  passwordEncryption() {
    this.passwordDigest = SHA3(this.passwordDigest, {
      outputLength: 256,
    }).toString();
  }

  toJSON() {
    return omit(this, ['passwordDigest']);
  }

  constructor(data: Partial<User>) {
    data && Object.assign(this, data);
  }
}

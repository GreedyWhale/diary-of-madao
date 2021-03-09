/*
 * @Description: users表关联实体
 * @Author: MADAO
 * @Date: 2021-03-08 14:15:42
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-08 16:20:09
 */
import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { Blog } from './Blog'
import { Comment } from "./Comment";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar')
  username: string;

  @Column('varchar')
  passwordDigest: string;

  @Column('timestamp')
  createdAt: string;

  @Column('timestamp')
  updatedAt: string;

  @OneToMany(() => Blog, Blog => Blog.author)
  blogs: Blog[];

  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];

  constructor(data: Partial<User>){
    data && Object.assign(this, data)
  }
}

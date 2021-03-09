/*
 * @Description: comments 表关联实体
 * @Author: MADAO
 * @Date: 2021-03-08 14:42:14
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-08 16:20:20
 */
import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import { Blog } from "./Blog";
import { User } from "./User";

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text')
  content: string;

  @Column('timestamp')
  createdAt: string;

  @Column('timestamp')
  updatedAt: string;

  @ManyToOne(() => User, user => user.comments)
  user: User;

  @ManyToOne(() => Blog, blog => blog.comments)
  blog: Blog;

  constructor(data: Partial<Comment>){
    data && Object.assign(this, data)
  }
}

/*
 * @Description: comments 表关联实体
 * @Author: MADAO
 * @Date: 2021-03-08 14:42:14
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-10 15:08:37
 */
import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './Blog';
import { User } from './User';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text')
  content: string;

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp')
  updatedAt: Date;

  @Column('integer')
  userId: number;

  @Column('integer')
  blogId: number;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Blog, (blog) => blog.comments)
  @JoinColumn({ name: 'blogId', referencedColumnName: 'id' })
  blog: Blog;

  constructor(data: Partial<Comment>) {
    data && Object.assign(this, data);
  }
}

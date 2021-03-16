/*
 * @Description: blogs 表关联实体
 * @Author: MADAO
 * @Date: 2021-03-08 14:22:06
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-10 15:08:45
 */
import {
  Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Comment } from './Comment';
import { User } from './User';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar')
  title: string;

  @Column('text')
  content: string;

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp')
  updatedAt: Date;

  @Column('integer')
  authorId: number;

  @ManyToOne(() => User, (user) => user.blogs, { nullable: true })
  @JoinColumn({ name: 'authorId', referencedColumnName: 'id' })
  author: User;

  @OneToMany(() => Comment, (comment) => comment.blog)
  comments: Comment[];

  constructor(data: Partial<Blog>) {
    data && Object.assign(this, data);
  }
}

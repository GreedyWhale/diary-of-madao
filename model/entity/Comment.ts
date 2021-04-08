/*
 * @Description: comments 实体
 * @Author: MADAO
 * @Date: 2021-04-08 21:13:32
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 22:22:12
 */
import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
import { Base } from './Base';
import { User } from './User';
import { Post } from './Post';

@Entity('comments')
export class Comment extends Base {
  @Column('text')
  content: string;

  @Column('integer')
  userId: number;

  @Column('integer')
  postId: number;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'postId', referencedColumnName: 'id' })
  post: Post;

  constructor(data: Partial<Comment>) {
    super();
    data && Object.assign(this, data);
  }
}

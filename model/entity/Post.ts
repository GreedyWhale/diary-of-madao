/*
 * @Description: posts表实体
 * @Author: MADAO
 * @Date: 2021-04-08 16:53:25
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 22:22:31
 */
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Base } from './Base';
import { User } from './User';
import { Comment } from './Comment';

@Entity('posts')
export class Post extends Base {
  @Column('varchar')
  title: string;

  @Column('text')
  content: string;

  @Column('varchar')
  classified: string;

  @Column('integer')
  authorId: number;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'authorId', referencedColumnName: 'id' })
  author: User;

  @OneToMany(() => Comment, (comment) => comment.post, {
    cascade: true,
  })
  comments: Comment[];

  constructor(data: Partial<Post>) {
    super();
    data && Object.assign(this, data);
  }
}

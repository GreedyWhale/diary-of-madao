/*
 * @Description: blogs 表关联实体
 * @Author: MADAO
 * @Date: 2021-03-08 14:22:06
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-08 16:19:38
 */
import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { Comment } from "./Comment";
import { User } from "./User";

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar')
  title: string;

  @Column('text')
  content: string;

  @Column('timestamp')
  createdAt: string;

  @Column('timestamp')
  updatedAt: string;

  @ManyToOne(() => User, user => user.blogs)
  author: User;

  @OneToMany(() => Comment, comment => comment.blog)
  comments: Comment[];

  constructor(data: Partial<Blog>){
    data && Object.assign(this, data)
  }
}

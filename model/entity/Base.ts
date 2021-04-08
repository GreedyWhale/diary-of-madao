/*
 * @Description: 基础实体
 * @Author: MADAO
 * @Date: 2021-04-08 16:56:53
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 16:58:06
 */

import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class Base {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

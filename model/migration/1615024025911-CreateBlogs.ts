/*
 * @Description: 创建 blogs 表
 * @Author: MADAO
 * @Date: 2021-03-06 17:47:05
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 11:35:04
 */
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateBlogs1615024025911 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'blogs',
      columns: [
        {
          name: 'id', type: 'bigint', isPrimary: true, isNullable: false, generationStrategy: 'increment',
        },
        { name: 'title', type: 'varchar', isNullable: false },
        { name: 'content', type: 'text', isNullable: false },
        { name: 'authorId', type: 'bigint', isNullable: false },
        {
          name: 'createdAt', type: 'timestamp', isNullable: false, default: 'now()',
        },
        {
          name: 'updatedAt', type: 'timestamp', isNullable: false, default: 'now()',
        },
      ],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('blogs');
  }
}

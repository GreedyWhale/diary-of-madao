/*
 * @Description: 创建posts表
 * @Author: MADAO
 * @Date: 2021-04-08 15:28:40
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 15:40:09
 */
import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import setCommonColumns from '~/model/tools/setCommonColumns';

export class CreatePosts1617866920758 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'posts',
      columns: setCommonColumns([
        { name: 'title', type: 'varchar(100)', isNullable: false },
        { name: 'content', type: 'text', isNullable: false },
        { name: 'authorId', type: 'integer', isNullable: false },
        { name: 'classified', type: 'varchar(100)', isNullable: false },
      ]),
    }), true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('posts', true);
  }
}

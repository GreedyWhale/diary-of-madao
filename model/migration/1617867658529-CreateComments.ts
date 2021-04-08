/*
 * @Description: 创建comments表
 * @Author: MADAO
 * @Date: 2021-04-08 15:40:58
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 15:45:00
 */
import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import setCommonColumns from '~/model/tools/setCommonColumns';

export class CreateComments1617867658529 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'comments',
      columns: setCommonColumns([
        { name: 'userId', type: 'integer', isNullable: false },
        { name: 'content', type: 'text', isNullable: false },
        { name: 'postId', type: 'integer', isNullable: false },
      ]),
    }), true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('comments', true);
  }
}

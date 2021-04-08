/*
 * @Description: 创建users表
 * @Author: MADAO
 * @Date: 2021-04-08 13:38:47
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 15:57:31
 */
import {
  MigrationInterface, QueryRunner, Table, TableIndex,
} from 'typeorm';
import setCommonColumns from '~/model/tools/setCommonColumns';

export class CreateUsers1617860327525 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'users',
      columns: setCommonColumns([
        { name: 'username', type: 'varchar(100)', isNullable: false },
        { name: 'passwordDigest', type: 'varchar(1024)', isNullable: false },
      ]),
    }), true);
    await queryRunner.createIndex('users', new TableIndex({
      name: 'username_unique',
      columnNames: ['username'],
      isUnique: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users', true);
  }
}

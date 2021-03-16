/*
 * @Description: 给users表的username添加唯一索引
 * @Author: MADAO
 * @Date: 2021-03-11 16:55:54
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-11 17:31:29
 */
import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddUniqueIndexToUsername1615452954116 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex('users', new TableIndex({
      name: 'username_unique',
      columnNames: ['username'],
      isUnique: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'username_unique');
  }
}

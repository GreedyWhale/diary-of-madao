/*
 * @Description: 创建users
 * @Author: MADAO
 * @Date: 2021-03-06 16:54:10
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 11:32:45
 */
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsers1615020850775 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        {
          name: 'id', isPrimary: true, type: 'bigint', generationStrategy: 'increment', isNullable: false,
        },
        { name: 'username', type: 'varchar', isNullable: false },
        { name: 'passwordDigest', type: 'varchar', isNullable: false },
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
    await queryRunner.dropTable('users');
  }
}

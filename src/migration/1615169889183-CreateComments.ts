/*
 * @Description: 
 * @Author: MADAO
 * @Date: 2021-03-08 10:18:09
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-08 10:30:17
 */
import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateComments1615169889183 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'comments',
      columns: [
        { name: 'id', type: 'bigint', isPrimary: true, isNullable: false, generationStrategy: 'increment' },
        { name: 'blogId', type: 'bigint', isNullable: false },
        { name: 'userId', type: 'bigint', isNullable: false },
        { name: 'content', type: 'text', isNullable: false },
        { name: 'createdAt', type:  'timestamp', isNullable: false, default: 'now()' },
        { name: 'updatedAt', type:  'timestamp', isNullable: false, default: 'now()' }
      ]
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }

}

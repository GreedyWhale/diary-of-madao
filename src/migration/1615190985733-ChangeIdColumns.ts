/*
 * @Description: 补充id字段的isGenerated属性
 * @Author: MADAO
 * @Date: 2021-03-08 16:09:45
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-08 16:13:07
 */
import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class changeIdColumns1615190985733 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn('users', 'id', new TableColumn({
      name: 'id', isPrimary: true, type: 'bigint', generationStrategy: 'increment', isNullable: false, isGenerated: true
    }))
    await queryRunner.changeColumn('blogs', 'id', new TableColumn({
      name: 'id', isPrimary: true, type: 'bigint', generationStrategy: 'increment', isNullable: false, isGenerated: true
    }))
    await queryRunner.changeColumn('comments', 'id', new TableColumn({
      name: 'id', isPrimary: true, type: 'bigint', generationStrategy: 'increment', isNullable: false, isGenerated: true
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn('users', 'id', new TableColumn({
      name: 'id', isPrimary: true, type: 'bigint', generationStrategy: 'increment', isNullable: false
    }))
    await queryRunner.changeColumn('blogs', 'id', new TableColumn({
      name: 'id', isPrimary: true, type: 'bigint', generationStrategy: 'increment', isNullable: false
    }))
    await queryRunner.changeColumn('comments', 'id', new TableColumn({
      name: 'id', isPrimary: true, type: 'bigint', generationStrategy: 'increment', isNullable: false
    }))
  }

}

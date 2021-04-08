/*
 * @Description: 修改users，blogs，comments表id字段类型
 * @Author: MADAO
 * @Date: 2021-03-08 10:37:48
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 11:34:15
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyIdDataType1615171068066 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE users ALTER COLUMN id TYPE integer;');
    await queryRunner.query('ALTER TABLE blogs ALTER COLUMN id TYPE integer;');
    await queryRunner.query('ALTER TABLE comments ALTER COLUMN id TYPE integer;');
    await queryRunner.query('ALTER TABLE blogs ALTER COLUMN "authorId" TYPE integer;');
    await queryRunner.query('ALTER TABLE comments ALTER COLUMN "blogId" TYPE integer;');
    await queryRunner.query('ALTER TABLE comments ALTER COLUMN "userId" TYPE integer;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE users ALTER COLUMN id TYPE bigint;');
    await queryRunner.query('ALTER TABLE blogs ALTER COLUMN id TYPE bigint;');
    await queryRunner.query('ALTER TABLE comments ALTER COLUMN id TYPE bigint;');
    await queryRunner.query('ALTER TABLE blogs ALTER COLUMN "authorId" TYPE bigint;');
    await queryRunner.query('ALTER TABLE comments ALTER COLUMN "blogId" TYPE bigint;');
    await queryRunner.query('ALTER TABLE comments ALTER COLUMN "userId" TYPE bigint;');
  }
}

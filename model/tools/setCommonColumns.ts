/*
 * @Description: 设置数据表的通用列
 * @Author: MADAO
 * @Date: 2021-04-08 13:42:42
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 13:48:35
 */

import type { TableColumnOptions } from 'typeorm/schema-builder/options/TableColumnOptions';

export default function setCommonColumns(columns: TableColumnOptions[]) {
  return columns.concat([
    {
      name: 'id',
      type: 'integer',
      isNullable: false,
      isGenerated: true,
      generationStrategy: 'increment',
    },
    {
      name: 'createdAt',
      type: 'timestamp',
      isNullable: false,
      default: 'now()',
    },
    {
      name: 'updatedAt',
      type: 'timestamp',
      isNullable: false,
      default: 'now()',
    },
  ]);
}

/*
 * @Description: 基础Model类
 * @Author: MADAO
 * @Date: 2022-10-31 11:09:04
 * @LastEditors: MADAO
 * @LastEditTime: 2022-12-06 15:09:48
 */
import type { Response } from '~/lib/api';
import type { Rules, CustomObject } from '~/lib/validator';

import { validator } from '~/lib/validator';
import { formatResponse } from '~/lib/api';

class BaseModel {
  async validator<T extends CustomObject>(dataSource: T, rules: Rules<T> = []) {
    const errors = validator(dataSource, rules);

    if (errors) {
      return Promise.reject(formatResponse({ status: 422, errors: errors as Response<unknown>['errors'] }));
    }
  }

  async execSql<T extends Promise<unknown>, R = Response<Awaited<T>>>(sql: T, formatFn?: (result: Awaited<T>) => R): Promise<R> {
    try {
      const result = await sql;
      if (formatFn) {
        return formatFn(result);
      }

      return formatResponse({ resource: result }) as R;
    } catch (error) {
      return formatResponse({ status: 500, message: (error as Error).message }) as R;
    }
  }
}

export default BaseModel;

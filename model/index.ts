/*
 * @Description: 基础Model类
 * @Author: MADAO
 * @Date: 2022-10-31 11:09:04
 * @LastEditors: MADAO
 * @LastEditTime: 2022-10-31 18:55:40
 */
import type { Response } from '~/lib/api';
import type { Rules, FormData } from '~/lib/validator';

import { validator } from '~/lib/validator';
import { formatResponse } from '~/lib/api';

class BaseModel {
  async validator<T extends FormData>(formData: T, rules: Rules<T> = []) {
    const errors = validator(formData, rules);

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

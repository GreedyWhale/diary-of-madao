/*
 * @Description: 表单验证
 * @Author: MADAO
 * @Date: 2022-09-30 11:27:12
 * @LastEditors: MADAO
 * @LastEditTime: 2022-12-06 14:49:28
 */
export type CustomObject = Record<string, any>;

export type Rules<T> = Array<{
  key: keyof T;
  message: string;
  required: boolean | ((_value: T[keyof T]) => boolean);
}>;

type Errors<T> = {
  [key in keyof T]?: string[]
};

export const validator = <T extends CustomObject>(dataSource: T, rules: Rules<T>): Errors<T> | undefined => {
  const errors: Errors<T> = {};

  rules.forEach(rule => {
    const value = dataSource[rule.key];

    if (typeof rule.required === 'boolean') {
      if (value !== 0 && !value) {
        errors[rule.key] = errors[rule.key] || [];
        errors[rule.key]?.push(rule.message);
      }

      return;
    }

    const passed = rule.required(value);
    if (!passed) {
      errors[rule.key] = errors[rule.key] || [];
      errors[rule.key]?.push(rule.message);
    }
  });

  if (Object.keys(errors).length === 0) {
    return;
  }

  return errors;
};

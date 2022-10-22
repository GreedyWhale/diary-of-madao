import type { FormItemRef } from '~/components/FormItem';

import React from 'react';

import styles from './index.module.scss';
import { Button } from '~/components/Button';

type FormProps = {
  onFinish?: (values: any) => Promise<any>;
  button?: React.ReactNode;
  customButtons?: React.ReactNode;
  className?: string;
};

export type FormRef = {
  validator: () => boolean;
  getFormValues: () => Record<string, any>;
};

// eslint-disable-next-line react/display-name
export const Form = React.forwardRef<FormRef, React.PropsWithChildren<FormProps>>((props, ref) => {
  const formItemsRef = React.useRef<FormItemRef[]>([]);

  const validator = () => formItemsRef.current.every(item => item.validator());
  const getFormValues = () => {
    const values = {};
    formItemsRef.current.forEach(item => { Object.assign(values, item.getItemValue()); });
    return values;
  };

  const handleClick = async (el: React.MouseEvent<HTMLButtonElement>) => {
    el.preventDefault();
    if (!validator()) {
      return;
    }

    await props.onFinish?.(getFormValues());
  };

  React.useImperativeHandle(ref, () => ({
    validator,
    getFormValues,
  }));

  return (
    <form className={[styles.container, props.className ?? ''].join(' ')}>
      {React.Children.map(props.children, (child, index) => {
        const _child = child as React.ReactElement;
        if (_child) {
          return React.cloneElement(_child, {
            ref(ref: FormItemRef) { formItemsRef.current[index] = ref; },
          });
        }

        return child;
      })}

      {props.customButtons
        ? props.customButtons
        : <Button theme='default' onClick={handleClick}>{props.button}</Button>
      }
    </form>
  );
});

Form.defaultProps = {
  button: '提交',
};

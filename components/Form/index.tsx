import type { FormItemRef } from '~/components/FormItem';

import React from 'react';

import styles from './index.module.scss';
import { Button } from '~/components/Button';

type FormProps = {
  onFinish: (values: any) => Promise<any>;
  button?: React.ReactNode;
};

export const Form: React.FC<React.PropsWithChildren<FormProps>> = props => {
  const formItemsRef = React.useRef<FormItemRef[]>([]);

  const handleClick = async (el: React.MouseEvent<HTMLButtonElement>) => {
    el.preventDefault();
    const passed = formItemsRef.current.every(item => item.validator());

    if (!passed) {
      return;
    }

    const values = {};
    formItemsRef.current.forEach(item => { Object.assign(values, item.getItemValue()); });
    await props.onFinish(values);
  };

  return (
    <form className={styles.container}>
      {React.Children.map(props.children, (child, index) => {
        const _child = child as React.ReactElement;
        if (_child) {
          return React.cloneElement(_child, {
            ref(ref: FormItemRef) { formItemsRef.current[index] = ref; },
          });
        }

        return child;
      })}

      <Button theme='default' onClick={handleClick}>{props.button ?? '提交'}</Button>
    </form>
  );
};

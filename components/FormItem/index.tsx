/* eslint-disable react/display-name */
import React from 'react';

import styles from './index.module.scss';

type FormItemProps = {
  label: string;
  name: string;
  type?: 'text' | 'password';
  placeholder?: string;
  validator?: {
    require: boolean | (<T>(value: T) => boolean);
    message: string;
  };
};

export type FormItemRef = {
  getItemValue: () => Record<string, any>;
  validator: () => boolean;
};

export const FormItem = React.forwardRef<unknown, FormItemProps>((props, ref) => {
  const valueRef = React.useRef('');
  const [visible, setVisible] = React.useState(false);
  const [verificationMessage, setVerificationMessage] = React.useState('');

  React.useImperativeHandle(ref, () => ({
    getItemValue: () => ({
      [props.name]: valueRef.current,
    }),

    validator() {
      if (props.validator) {
        let passed = false;
        if (typeof props.validator.require === 'boolean') {
          passed = Boolean(valueRef.current);
        } else {
          passed = props.validator.require(valueRef.current);
        }

        console.log(Boolean(valueRef.current), valueRef.current);
        if (!passed) {
          setVerificationMessage(props.validator.message);
        }

        return passed;
      }

      return true;
    },

  }));

  return (
    <div className={styles.container}>
      <label htmlFor={props.name}>{props.label}</label>
      <div className={styles.input_wrap}>
        <span>→</span>
        <input
          name={props.name}
          id={props.name}
          type={visible ? 'text' : (props.type ?? 'text')}
          placeholder={props.placeholder}
          onChange={el => {
            if (verificationMessage) {
              setVerificationMessage('');
            }

            valueRef.current = el.target.value;
          }}
          autoComplete='off'
        />
        {props.type === 'password' && (
          <div
            className={styles.eyes_icon}
            onClick={() => { setVisible(prev => !prev); }}
          >
            {visible ? '🫣' : '😑'}
          </div>
        )}
      </div>
      {verificationMessage && (
        <p className={styles.verification_message}>{verificationMessage}</p>
      )}
    </div>
  );
});

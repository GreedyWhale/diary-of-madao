import React from 'react';
import { isEmpty } from 'lodash';

import styles from './index.module.scss';

export type FormItemProps = {
  label: React.ReactNode;
  name: string;
  type?: 'text' | 'password' | 'radio' | 'checkbox';
  placeholder?: string;
  validator?: {
    require: boolean | (<T>(value: T) => boolean);
    message: string;
  };
  options?: Array<{ label: string; value: string | number | boolean | Record<string, any>; }>;
  className?: string;
};

export type FormItemRef = {
  getItemValue: () => Record<string, any>;
  validator: () => boolean;
};

// eslint-disable-next-line react/display-name
export const FormItem = React.forwardRef<FormItemRef, FormItemProps>((props, ref) => {
  const valueRef = React.useRef('');
  const [visible, setVisible] = React.useState(false);
  const [verificationMessage, setVerificationMessage] = React.useState('');
  const [radioSelectedIndex, setRadioSelectedIndex] = React.useState(0);
  const [checkboxSelectedIndex, setCheckboxSelectedIndex] = React.useState<number[]>([]);

  const fetchOptionsIndex = (index: number) => {
    if (props.type === 'radio') {
      setRadioSelectedIndex(index);
    } else {
      const newCheckboxSelectedIndex = checkboxSelectedIndex.includes(index)
        ? checkboxSelectedIndex.filter(i => i !== index)
        : ([...new Set(checkboxSelectedIndex.concat(index))] as number[]);

      setCheckboxSelectedIndex(newCheckboxSelectedIndex);
    }
  };

  const getItemValue = () => {
    if (props.type === 'radio') {
      return {
        [props.name]: props.options![radioSelectedIndex].value,
      };
    }

    if (props.type === 'checkbox') {
      return {
        [props.name]: props.options!.filter((item, index) => checkboxSelectedIndex.includes(index)),
      };
    }

    return {
      [props.name]: valueRef.current,
    };
  };

  React.useImperativeHandle(ref, () => ({
    getItemValue,

    validator() {
      if (props.validator) {
        const values = getItemValue();
        const passed = typeof props.validator.require === 'boolean'
          ? typeof values[props.name] === 'object' ? !isEmpty(values[props.name]) : Boolean(values[props.name])
          : props.validator.require(values);

        if (!passed) {
          setVerificationMessage(props.validator.message);
        }

        return passed;
      }

      return true;
    },

  }));

  return (
    <div className={[styles.container, props.className].join(' ')}>
      <label htmlFor={props.name}>{props.label}</label>
      {['password', 'text'].includes(props.type ?? '') && (
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
      )}
      {['radio', 'checkbox'].includes(props.type ?? '') && (
        <ul className={styles.options_wrap}>
          {props.options?.map((option, index) => (
            <li
              key={option.label}
              data-selected={props.type === 'radio' ? radioSelectedIndex === index : checkboxSelectedIndex.includes(index)}
              onClick={() => {
                if (verificationMessage) {
                  setVerificationMessage('');
                }

                fetchOptionsIndex(index);
              }}
            >
              <div
                className={styles.option_prefix}
                data-shape={props.type === 'radio' ? 'circle' : ''}
              >
                <span />
              </div>
              <span>{option.label}</span>
            </li>
          ))}
        </ul>
      )}
      {verificationMessage && (
        <p className={styles.verification_message}>{verificationMessage}</p>
      )}
    </div>
  );
});

FormItem.defaultProps = {
  className: '',
  type: 'text',
};

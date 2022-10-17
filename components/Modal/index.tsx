import type { ButtonProps } from '~/components/Button';

import React from 'react';
import { createRoot } from 'react-dom/client';

import styles from './index.module.scss';
import { Mask } from '~/components/Mask';
import { Button } from '~/components/Button';

type ModelProps = {
  content?: React.ReactNode;
  title?: string;
  buttons?: Array<Omit<ButtonProps, 'onClick'> & { content: string; }>;
  onDestroyed?: () => void;
  onClick?: (index: number) => Promise<any>;
  hideButtons?: boolean;
};

export const Model: React.FC<React.PropsWithChildren<ModelProps>> = props => {
  const handleClick = async (index: number) => {
    if (props.onClick) {
      try {
        await props.onClick(index);
      } catch (error) {}
    }

    if (props.onDestroyed) {
      props.onDestroyed();
    }
  };

  return (
    <div className={styles.container}>
      <Mask />
      <main>
        <h3>{props.title}</h3>
        <div className={styles.content}>
          {props.content ?? props.children}
        </div>
        {!props.hideButtons && (
          <div className={styles.buttons}>
            {props.buttons?.map((value, index) => (
              <Button {...value} key={value.content} onClick={async () => handleClick(index)}>
                {value.content}
              </Button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

Model.defaultProps = {
  title: '提示',
  buttons: [{ content: '确定' }],
};

export const showModal = (params: ModelProps) => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const root = createRoot(div);

  root.render(
    <Model
      {...params}
      onDestroyed={() => {
        root.unmount();
        div.remove();
      }}
    />,
  );
};

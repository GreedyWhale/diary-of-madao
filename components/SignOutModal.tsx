import type { ModalProps } from 'semantic-ui-react';

import React from 'react';
import { Modal, Header as SemanticUIHeader, Icon, Button } from 'semantic-ui-react';

import { useSignOut } from '~/utils/hooks/useUser';

type SignOutModalProps = ModalProps & {
  onCancel?: () => void;
  onConfirm?: () => void;
}

const SignOutModal = (props: SignOutModalProps) => {
  const { onCancel, onConfirm, ...rest } = props;

  const signOut = useSignOut();

  const _onConfirm = async () => {
    await signOut();

    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Modal
      {...rest}
      basic
      size="small"
      header={
        <SemanticUIHeader icon>
          <Icon name="sign-out" />
          退出账号
        </SemanticUIHeader>
      }
      content="确定退出当前账号吗？"
      actions={[
        <Button
          basic
          color="red"
          inverted
          onClick={onCancel}
          key="cancel"
        >
          <Icon name="remove" /> 取消
        </Button>,
        <Button
          positive
          inverted
          color="green"
          key="confirm"
          onClick={_onConfirm}
        >
          <Icon name="checkmark" /> 确定
        </Button>,
      ]}
    />
  );
};

export default SignOutModal;

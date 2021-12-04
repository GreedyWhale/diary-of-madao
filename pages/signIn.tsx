import type { NextPage, InferGetServerSidePropsType } from 'next';

import React from 'react';
import { useRouter } from 'next/router';

import styles from '~/assets/styles/signIn.module.scss';
import Layout from '~/components/Layout';
import CustomButton from '~/components/Button';
import SignOutModal from '~/components/SignOutModal';

import { signIn } from '~/services/user';
import showNotification from '~/components/Notification';
import { withSession } from '~/utils/withSession';

const SignIn: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
  const router = useRouter();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [visiblePassword, setVisiblePassword] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const memoizedFormDate = React.useMemo(() => ([
    {
      key: 'username',
      value: username,
      errorMessage: '用户名格式错误，用户名长度3～20位，由字母或数字组成',
      reg: /^[\w\d]{3,20}$/,
    },
    {
      key: 'password',
      value: password,
      errorMessage: '密码格式错误，密码长度6～15位，由字母或数字组成',
      reg: /^[\w\d]{6,15}$/,
    },
  ]), [username, password]);

  const validator = () => {
    const isPassed = memoizedFormDate.every(item => {
      if (!item.reg.test(item.value)) {
        setErrorMessage(item.errorMessage);
        return false;
      }

      return true;
    });

    return isPassed;
  };

  const onSubmit = async () => {
    if (!validator()) {
      return;
    }

    await signIn({ username, password })
      .then(res => {
        showNotification({
          content: res.message,
          theme: 'success',
        });

        router.replace('/');
      });
  };

  React.useEffect(() => {
    setErrorMessage('');
  }, [username, password]);

  React.useEffect(() => {
    if (props.userId !== -1) {
      setOpen(true);
    }
  }, [props.userId]);

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.formItem}>
          <label htmlFor="username">请输入用户名</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputPrefix}>→</span>
            <input
              type="text"
              id="username"
              onChange={event => setUsername(event.target.value)}
              placeholder="用户名长度3～20位，由字母或数字组成"
            />
          </div>
        </div>
        <div className={styles.formItem}>
          <label htmlFor="password">请输入密码</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputPrefix}>→</span>
            <input
              type={visiblePassword ? 'text' : 'password'}
              id="password"
              onChange={event => setPassword(event.target.value)}
              placeholder="密码长度6～15位，由字母或数字组成"
            />
            <span
              className={styles.eyesIcon}
              onClick={() => setVisiblePassword(prev => !prev)}
            />
          </div>
        </div>
        <p
          className={styles.errorMessage}
          data-visible={Boolean(errorMessage)}
        >
          <span>✕</span>{errorMessage}
        </p>
        <p className={styles.tips}>* 首次登录会默认注册账号</p>
        <CustomButton onClick={onSubmit} inverted color="green">
          登录
        </CustomButton>
      </div>
      <SignOutModal
        open={open}
        onCancel={() => router.replace('/')}
        onClose={() => router.replace('/')}
      />
    </Layout>
  );
};

export default SignIn;

export const getServerSideProps = withSession();

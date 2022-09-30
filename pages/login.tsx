import type { NextPage } from 'next';

import { useRouter } from 'next/router';

import styles from '~/assets/styles/pages/login.module.scss';
import { Form } from '~/components/Form';
import { FormItem } from '~/components/FormItem';

import { login } from '~/services/user';

const Login: NextPage = () => {
  const router = useRouter();
  const handleFinish = async (values: Parameters<typeof login>[0]) => {
    await login(values);
    router.replace('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.sun}>
          <div className={styles.sun_inner}/>
          <div className={styles.sun_mask}/>
        </div>
      </div>
      <div className={styles.right}>
        <h1>Welcome Back!</h1>
        <p>* 首次登录会默认注册账号（由于备案原因，暂不开放注册）</p>

        <Form onFinish={handleFinish} button='登录'>
          <FormItem label='请输入用户名' name='username' validator={{ require: true, message: '必填' }} />
          <FormItem label='请输入密码' name='password' type='password' validator={{ require: true, message: '必填' }} />
        </Form>
      </div>
    </div>
  );
};

export default Login;

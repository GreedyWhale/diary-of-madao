import { GetServerSideProps, NextPage, InferGetServerSidePropsType } from 'next';
import React, { useCallback, useState } from 'react';
import axios, { AxiosError } from 'axios';
import withSession from '~/utils/withSession';

const TheInput: React.FC<{
  inputConfigs: {
    type: string;
    placeholder: string;
    name: string;
  }
  value: string;
  labelText: string;
  onChange: React.FormEventHandler<HTMLInputElement>
}> = (props) => {
  const {
    inputConfigs, labelText, value, onChange,
  } = props;
  return (
    <label htmlFor={inputConfigs.name}>
      {labelText}
      <input {...inputConfigs} value={value} onChange={onChange} />
    </label>
  );
};

const SignIp: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const inputList = [
    {
      id: 1,
      inputConfigs: { type: 'text', placeholder: '请输入用户名', name: 'username' },
      labelText: '用户名：',
      value: username,
      onChange: (event: React.FormEvent<HTMLInputElement>) => setUsername(event.currentTarget.value),
    },
    {
      id: 2,
      inputConfigs: { type: 'password', placeholder: '请输入密码', name: 'password' },
      labelText: '密码：',
      value: password,
      onChange: (event: React.FormEvent<HTMLInputElement>) => setPassword(event.currentTarget.value),
    },
  ];

  const onSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    axios.post('/api/v1/sessions', { username, password })
      .then((res) => {
        console.log(res);
      }, (error: AxiosError) => {
        console.log(error);
      });
  }, [username, password]);

  const { userId } = props;
  return (
    <div>
      <p>{userId}</p>
      <h1>登录</h1>
      <form onSubmit={onSubmit}>
        {inputList.map((config) => (
          <TheInput {...config} key={config.id} />
        ))}
        <button type="submit">提交</button>
      </form>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<{
  userId: number
}> = withSession(async (context) => {
  const userId = context.req.session.get('currentUser') || null;
  return {
    props: {
      userId,
    },
  };
});

export default SignIp;

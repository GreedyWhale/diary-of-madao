import axios, { AxiosError } from 'axios';
import { NextPage } from 'next';
import React, { useCallback, useState } from 'react';

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

const SignUp: NextPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signUpResults, setSignUpResults] = useState('');

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
    axios.post('/api/v1/users', { username, password }).then((response) => {
      setSignUpResults(response.data.message);
    }, (error: AxiosError) => {
      setSignUpResults(error.response ? error.response.data.message : error.message);
    });
  }, [username, password]);

  return (
    <div>
      {/* 之前代码保持不变 */}
      <h1>注册</h1>
      <p>{signUpResults}</p>
      <form onSubmit={onSubmit}>
        {inputList.map((config) => (
          <TheInput {...config} key={config.id} />
        ))}
        <button type="submit">提交</button>
      </form>
    </div>
  );
};

export default SignUp;

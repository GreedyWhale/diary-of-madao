import React from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';

const Home: NextPage = () => (
  <div>
    <style jsx>
      {`
        button { color: red; }
      `}
    </style>
    <h1>这是我的博客首页</h1>
    <Link href="/blogs">
      <button type="button">博客列表</button>
    </Link>
  </div>
);

export default Home;

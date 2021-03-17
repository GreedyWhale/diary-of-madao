import React from 'react';
import type { GetServerSideProps, NextPage, InferGetServerSidePropsType } from 'next';
import Link from 'next/link';
import useBlogs from '~/utils/hooks/useBlog';
import { Blog } from '~/model/entity/Blog';

const BlogList: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (props) => {
  const { blogs } = props;
  return (
    <>
      <div>文章列表</div>
      <ul>
        { blogs && blogs.map((blog) => (
          <li key={blog.id}>
            <Link href={`/blogs/${blog.id}`}>{blog.title}</Link>
          </li>
        )) }
      </ul>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<{
  blogs: Blog[]
}> = async () => {
  const { getBlogs } = useBlogs();
  const blogs = await getBlogs();
  return {
    props: { blogs },
  };
};

export default BlogList;

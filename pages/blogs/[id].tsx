import React from 'react';
import type { NextPage, GetServerSideProps, InferGetServerSidePropsType } from 'next';
import useBlogs from 'utils/hooks/useBlog';

const BlogDetails:NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (props) => {
  const { blog } = props;
  return (
    <div>{blog.content}</div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params } = context;
  const { getBlogDetails } = useBlogs();
  const blog = params
    ? await getBlogDetails(parseInt((params.id as unknown as string), 10))
    : { content: '文章不存在' };
  return {
    props: {
      blog,
    },
  };
};

export default BlogDetails;

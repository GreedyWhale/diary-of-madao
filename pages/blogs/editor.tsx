import React, {
  FormEventHandler,
  useCallback,
  useRef,
} from 'react';
import { GetServerSideProps, NextPage, InferGetServerSidePropsType } from 'next';
import axios from 'axios';
import withSession from '~/utils/withSession';

const BlogEditor: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (props) => {
  const { authorId } = props;
  const input = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const onSubmit: FormEventHandler<HTMLFormElement> = useCallback((e) => {
    e.preventDefault();
    axios.post('/api/v1/blogs', {
      title: input.current?.value,
      content: textarea.current?.value,
      authorId,
    }).then((res) => console.log(res), (err) => console.log(err));
  }, [input, textarea, authorId]);
  return (
    <div>
      <p>博客id:</p>
      <form onSubmit={onSubmit}>
        <label htmlFor="title">
          标题
          <input
            type="text"
            placeholder="请输入标题"
            name="title"
            ref={input}
          />
        </label>
        <br />
        <textarea ref={textarea} />
        <br />
        <button type="submit">提交</button>
      </form>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = withSession(async (context) => {
  const userId = context.req.session.get('currentUser') || null;
  if (!userId) {
    context.res.writeHead(307, { Location: '/users/signIn' });
    context.res.end();
  }
  return { props: { authorId: userId } };
});

export default BlogEditor;

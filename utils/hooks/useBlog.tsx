import getConnection from 'utils/getConnection';
import { Blog } from 'src/entity/Blog';

const getBlogDetails = async (id: number) => {
  const connection = await getConnection();
  const blog = await connection
    .getRepository(Blog)
    .createQueryBuilder('blog')
    .where('blog.id = :id', { id })
    .getOne();
  return JSON.parse(JSON.stringify(blog));
};

const getBlogs = async (): Promise<Blog[]> => {
  const connection = await getConnection();
  const blogs = await connection.getRepository(Blog).find();

  return JSON.parse(JSON.stringify(blogs));
};

export default function useBlogs() {
  return {
    getBlogs,
    getBlogDetails,
  };
}

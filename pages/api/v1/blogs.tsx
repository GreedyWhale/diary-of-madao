import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import {
  CODE_MISSING_BLOG_CONTENT,
  CODE_MISSING_BLOG_TITLE,
  CODE_MISSING_USER_ID,
  CODE_BLOG_CREATE_ERROR,
} from '~/utils/constants';
import setResponseData from '~/utils/setResponseData';
import { checkRequiredParams } from '~/utils/validateRequestMetadata';
import BlogController from '~/controller/Blog';
import withSession from '~/utils/withSession';

const createBlog = async (request: NextApiRequest, response: NextApiResponse) => {
  // 检查请求参数
  const { passed, missingKey } = checkRequiredParams(request.body, ['title', 'content', 'authorId']);
  if (!passed) {
    const errorCode: {[key: string]: number} = {
      title: CODE_MISSING_BLOG_TITLE,
      content: CODE_MISSING_BLOG_CONTENT,
      authorId: CODE_MISSING_USER_ID,
    };
    return setResponseData.call(response, 400, null, errorCode[missingKey]);
  }
  const { title, content, authorId } = request.body;
  const blogController = new BlogController({ title, content, authorId });
  const validationResult = await blogController.validator();
  if (validationResult === true) {
    const result = await blogController.create();
    return result
      ? setResponseData.call(response, 200, result)
      : setResponseData.call(response, 500, null, CODE_BLOG_CREATE_ERROR);
  }
  return setResponseData.call(response, 422, null, undefined, validationResult);
};

const blogs: NextApiHandler = async (request, response) => {
  if (!request.session.get('currentUser')) {
    response.redirect(307, '/users/signIn');
    response.end();
    return;
  }
  const { method } = request;
  switch (method) {
    case 'POST':
      return createBlog(request, response);
    case 'GET':
      return setResponseData.call(response, 200, null);
    case 'DELETE':
      return setResponseData.call(response, 200, null);
    case 'PUT':
      return setResponseData.call(response, 200, null);
    default:
      response.setHeader('Allow', 'POST GET DELETE PUT');
      return setResponseData.call(response, 405, null);
  }
};

export default withSession(blogs);

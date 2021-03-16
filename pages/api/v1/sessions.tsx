import { NextApiHandler } from 'next';
import withSession from '~/utils/withSession';
import setResponseData from '~/utils/setResponseData';
import SignInController from '~/controller/SignIn';
import { checkRequiredParams } from '~/utils/validateRequestMetadata';
import {
  CODE_MISSING_USERNAME,
  CODE_MISSING_PASSWORD,
} from '~/utils/constants';

const sessions: NextApiHandler = async (request, response) => {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return setResponseData.call(response, 405, null);
  }
  const { passed, missingKey } = checkRequiredParams(request.body, ['username', 'password']);
  if (!passed) {
    return missingKey === 'username'
      ? setResponseData.call(response, 400, null, CODE_MISSING_USERNAME)
      : setResponseData.call(response, 400, null, CODE_MISSING_PASSWORD);
  }
  const { username, password } = request.body;
  const signInController = new SignInController({ username, password });
  const validationResult = await signInController.validator();
  if (validationResult === true) {
    request.session.set('currentUser', signInController.user.id);
    await request.session.save();
    return setResponseData.call(response, 200, signInController.user);
  }
  return setResponseData.call(response, 422, null, undefined, validationResult);
};

export default withSession(sessions);

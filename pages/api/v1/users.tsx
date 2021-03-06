import { NextApiHandler } from 'next';
import { User } from '~/model/entity/User';
import getConnection from '~/utils/getConnection';
import setResponseData from '~/utils/setResponseData';
import SignUpController from '~/controller/SignUp';
import { checkRequiredParams } from '~/utils/validateRequestMetadata';
import {
  CODE_MISSING_USERNAME,
  CODE_MISSING_PASSWORD,
} from '~/utils/constants';

const users: NextApiHandler = async (request, response) => {
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
  const signUpController = new SignUpController({ username, password });
  const validationResult = await signUpController.validator();
  if (validationResult === true) {
    const user = new User({ username, passwordDigest: password });
    await (await getConnection()).manager.save(user);
    return setResponseData.call(response, 200, user);
  }
  return setResponseData.call(response, 422, null, undefined, validationResult);
};

export default users;

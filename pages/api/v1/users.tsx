import { NextApiHandler } from 'next';
import { User } from '~/src/entity/User';
import getConnection from '~/utils/getConnection';
import signUpValidator from '~/utils/signUpValidate';
import setResponseData from '~/utils/setResponseData';
import {
  CODE_MISSING_USERNAME,
  CODE_MISSING_PASSWORD,
} from '~/utils/constants';

const checkRequiredParams = (
  targetObject: {[key: string]: any},
  requiredKeys: string[],
) => {
  const targetObjectKeys = Object.keys(targetObject);
  let missingKey = '';
  const passed = requiredKeys.every((key) => {
    if (targetObjectKeys.indexOf(key) === -1) {
      missingKey = key;
      return false;
    }
    return true;
  });
  return {
    passed, missingKey,
  };
};

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
  const validationResult = await signUpValidator({ username, password });
  if (validationResult === true) {
    const user = new User({ username, passwordDigest: password });
    await (await getConnection()).manager.save(user);
    return setResponseData.call(response, 200, user);
  }
  return setResponseData.call(response, 422, null, undefined, validationResult);
};

export default users;

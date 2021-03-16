export const checkRequiredParams = (
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

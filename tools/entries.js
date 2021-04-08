/*
 * @Description: 获取model目录下的文件名
 * @Author: MADAO
 * @Date: 2021-03-12 10:33:41
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 14:08:46
 */
const fs = require('fs');
const { join, extname } = require('path');

const entries = {};

const getEntries = (path, prefix = '') => {
  const files = fs.readdirSync(path, {
    withFileTypes: true,
  });
  files.forEach((file) => {
    const currentPath = join(path, file.name);
    file.isFile()
      ? entries[join(prefix, file.name.replace(extname(file.name), ''))] = currentPath
      : getEntries(currentPath, join(prefix, file.name));
  });
};

getEntries(join(__dirname, '../model'));

module.exports = entries;

/*
 * @Description:  清除babel转译后文件目录
 * @Author: MADAO
 * @Date: 2021-03-02 16:53:17
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-02 16:56:50
 */

const fse = require('fs-extra')
const { join } = require('path')

try {
  fse.emptyDirSync(join(__dirname, '../dist'))
} catch(error) {
  console.error(error)
}
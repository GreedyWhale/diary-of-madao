/*
 * @Description: 手动部署脚本
 * @Author: MADAO
 * @Date: 2025-03-25 17:24:39
 * @LastEditors: MADAO
 * @LastEditTime: 2025-03-25 17:25:38
 */
import readline from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function deploy() {
  try {
    // 获取部署信息
    const host = await question('请输入服务器 IP: ');
    const username = await question('请输入用户名: ');
    const password = await question('请输入密码: ');

    console.log('\n开始部署...');
    
    // 执行部署命令
    const { stdout, stderr } = await execAsync(
      `sshpass -p "${password}" ssh ${username}@${host} 'bash -s' < bin/deploy.sh`
    );

    if (stdout) console.log(stdout);
    if (stderr) console.error('错误:', stderr);
    
    console.log('部署完成！');
  } catch (error) {
    console.error('部署失败:', error.message);
  } finally {
    rl.close();
  }
}

deploy();
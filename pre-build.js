const { spawn } = require('child_process');
const { svr_env: svrEnv } = process.env;
let script;
switch (svrEnv) {
  case 'test':
    script = 'build:uat';// 开发环境
    break;
  case '981605f4': // 自定义环境id
    script = 'build:test';// 测试环境
    break;
  case 'pre':
    script = 'build:pre';// 预发环境
    break;
  case 'hw_gray':
    script = 'build:prod'; // 生产环境-灰度
    break;
  case 'formal':
    script = 'build:prod'; // 生产环境
    break;
  default:
    script = 'build';
}
spawn('npm', ['run', script], {
  stdio: 'inherit',
});

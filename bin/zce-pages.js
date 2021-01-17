#!/usr/bin/env node

/*
  console.log(process.argv); 
  运行zce-pages --fdsf fsd
  [
    'C:\\Program Files\\nodejs\\node.exe',
    'C:\\Users\\xiang wang\\AppData\\Local\\Yarn\\Data\\link\\zce-pages\\bin\\zce-pages.js',
    '--fdsf',
    'fsd'
  ]
  所以需要在process.argv添加默认参数 --cwd 和 --gulpfile
*/

process.argv.push("--cwd");
process.argv.push(process.cwd());
process.argv.push("--gulpfile");
// 自动找package.json中配置的main目录
process.argv.push(require.resolve(".."));
require("gulp/bin/gulp");

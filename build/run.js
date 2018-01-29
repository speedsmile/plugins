/**package.json scripts 中执行被调用的复杂脚本
 * Created by weikaiwei on 2017/10/12.
 */

// let shell = require('shelljs');
// // 全局模式，shell命令都变为全局方法直接调用。shell.cp  =>  cp
// // require('shelljs/global')
//
// let path = require("path"), package = require("../package.json"), pname = package.name,
//   config = require("../config/property"),
//   distPath = path.join(config.serverPath, "dist", pname);
// // 把打包后的编译工程复制到服务器目录
// function dist(){
//   shell.rm("-rf", distPath);
//   shell.cp("-rf", "dist/", distPath);
// }
// dist();
console.log(process.argv.slice(2))

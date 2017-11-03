/**package.json scripts 中执行被调用的复杂脚本
 * Created by weikaiwei on 2017/10/12.
 */

var shell = require('shelljs');
// 全局模式，shell命令都变为全局方法直接调用。shell.cp  =>  cp
// require('shelljs/global')

// 把打包后的编译工程复制到服务器目录
function dist(){
  shell.rm("-rf", "e:/workspace/server/dist/permission");
  shell.cp("-rf", "dist/", "e:/workspace/server/dist/permission");
}
dist();

/**定义项目所需的服务器、插件库等信息
 * Created by weikaiwei on 2017/11/24.
 */
let path = require("path");
module.exports = {
  // 运行环境
  NODE_ENV: process.env.NODE_ENV || "dev",
  // 端口
  PORT: process.env.PORT || '3007',

  // 服务器项目
  server: "http://10.112.167.18/fe/anxun.git",
  // 服务器在本机上的路径
  serverPath: path.resolve(__dirname, "../../server"),
  // 公共类库、组件项目
  lib: "http://10.112.167.18/fe/plugins.git",
  // 公共类库、组件项目在本机上的路径
  libPath: path.resolve(__dirname, "../../plugins"),
  libSrc: path.resolve(__dirname, "../../plugins/src")
};

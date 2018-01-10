// https://github.com/michael-ciniawsky/postcss-load-config
module.exports = {
  // plugins支持对象格式和数组格式。对象格式的key是插件模块的路径,value是配置参数。数组格式手动加载插件模块
  // plugins: {
  //   "postcss-import": {},
  //   "autoprefixer": {},
  //   "./src/modules/cssunit": {source: "REM", rule: function(value, unit){return value / 100 + "rem"}}
  // }
  plugins: [
    // to edit target browsers: use "browserslist" field in package.json
    require("postcss-import"),
    require("autoprefixer"),
    require("./src/plugin/cssunit")({source: "REM", rule: function(value, unit){return value / 100 + "rem"}})
  ]
}

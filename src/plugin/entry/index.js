/**
 * Created by weikaiwei on 2017/9/21.
 * 扫描入口文件的规则
 */
/**@param entry String 入口路径
 * @param config Object 配置信息
      base String
      ext String （默认".js"） 入口模块的默认后缀
      templates Object html模板
        {
          "入口模块" : {
            template: html模板。
              默认：pc.html；
              m：m.html——移动端
            ext: ".html",
            title: "",
            output: "dist", 模板输出的路径
            filename: 模板名称，默认和js模块的路径一致（可以包含路径，路径会作为path的下级路径）
            inject: true,
            chunksPath: "", 模板引用chunks自动加上路径前缀
            chunks: 默认["manifest", "vendor", 入口模块] chunks中的"."会被替换成当前模块
            chunksSortMode: 'dependency',
            minify
          }
        }
      template Object templates模板参数的简单版，所有模板都使用一套配置，无法给所有模板单独指定title
        {
          template
          ext: ".html",
          title
          output: "dist"
          inject
          chunksPath: ""
          chunks: chunks中的"."会被替换成当前模块
          chunksSortMode: 'dependency',
          minify
        }
 *
 * */
let path = require("path");
function Entry (entry, config) {
  let fs = require("fs"), jsModule = {}, htmlModule = [],
    {ext = ".js", base = "", templates = {}, template = {}} = config || {};
  base = convertSep(base);
  require("glob").sync(entry).forEach(function (relpath) {
    var info = fs.statSync(relpath);
    if (info.isFile() && path.extname(relpath) == ext) {
      let refname = convertSep(relpath).replace(/\.[^.]*$/, ""), // 去掉模块的后缀名
        // 编译后的模块路径。去掉基于base的那部分
        key = base ? refname.replace(new RegExp("^(.*?/)?" + join(base, "?")), "") : refname;

      jsModule[key] = "./" + refname;
      // 对应的html模板
      htmlModule.push(htmlTemplate(key, Object.assign({}, template, templates[key])))
    }
  });
  return {js: jsModule, html: htmlModule};
}
/**
 * @param module 模块名称
 * @param o 模板配置
 * */
function htmlTemplate(module, o){
  let defaults = {
    ext: ".html",
    title: "",
    inject: true,
    chunksSortMode: 'dependency',
    minify: {
      removeComments: true, // 清除html中注释的部分
      collapseWhitespace: true, // 清除空格，压缩html
      collapseBooleanAttributes: true, // 省略布尔属性的值，比如：<input checked="checked"/>,那么设置这个属性后，就会变成 <input checked/>;
      removeEmptyAttributes: true, // 清除所有的空属性（自定义属性不会被清除）
      removeScriptTypeAttributes: true, // 清除所有script标签中的type="text/javascript"属性
      removeStyleLinkTypeAttributes: true, // 清除所有Link标签上的type属性
      minifyJS: true, // 压缩html中的javascript代码
      minifyCSS: true // 压缩html中的css代码
    }
  },
    config = Object.assign({}, defaults, o),
    htmlTemplates = {
    "m": path.resolve(__dirname, "template/m.html"),
    "vue/pc": path.resolve(__dirname, "template/vue/pc.html"),
    "vue/m": path.resolve(__dirname, "template/vue/m.html"),
  };
  let chunks = config.chunks ? ((config.chunks instanceof Array) ? config.chunks : [config.chunks]) : ["manifest", "vendor", module];
  // chunks中的"."会被替换成当前模块，如果存在chunksPath，自动加上作为chunks的父级路径
  chunks = chunks.map(chunk => path.posix.join(config.chunksPath || "", chunk === "." ? module : chunk));
  // template 引用的模板路径
  let htmlTemplate = path.resolve(__dirname, "template/pc.html");
  // 设置了模板路径，如果没有对应的别名模板，就使用传入的模板名称
  if(config.template){
    htmlTemplate = htmlTemplates[config.template] || config.template;
  }
  // filename 模板输出路径，默认和模块的路径一致
  let filename = config.filename || module;
  // 如果设置了文件后缀，不再重复拼接后缀名称
  filename = convertSep(path.join(config.output || "", filename + (filename.endsWith(config.ext) ? "" : config.ext)));
  return Object.assign(defaults, config, {chunks, template: convertSep(htmlTemplate), filename})
}
// 把所有盘符分割符号统一成"/"
function convertSep(s){
  return s.replace(/\\/g, "/")
}
function join(...args){
  let s = convertSep(args[0]);
  for(let i = 1; i< args.length; i++){
    s += (s.endsWith("/") ? "" : "/") + convertSep(args[i])
  }
  return s;
}
module.exports = Entry;

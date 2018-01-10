/**
 * Created by weikaiwei on 2017/9/21.
 * 扫描入口文件的规则
 */
module.exports = function (entry, config) {
  var path = require("path"), sep = path.sep, fs = require("fs"),
    base = config && config.base && config.base.toString() || "", obj = {};
  require("glob").sync(entry).forEach(function (relpath) {
    var info = fs.statSync(relpath);
    if (info.isFile()) {
      let refname = relpath.replace(/\.[^.]*$/, ""), // 去掉模块的后缀名
        // 编译后的模块路径。去掉基于base的那部分
        key = refname.replace(new RegExp("^(\\.?" + sep + ")?" + base + sep + "?"), "");
      obj[key] = "." + sep + refname;
    }
  });
  return obj;
};

/**
 * Created by weikaiwei on 2017/9/21.
 * 扫描入口文件的规则
 * 双下划线“__”开头的文件夹和文件都从入口文件排除
 */
module.exports = function (entry, config) {
    var fs = require("fs"), path = require("path"), base = config && config.base || "", obj = {};
    base = base.replace(/^(\.?[\\/])|(\.[\\/])?/, "").replace(/[\\/]$/, "").replace(/\\/g, "/");
    readDirSync(entry);
    function readDirSync(filepath) {
        let basename = path.basename(filepath);
        if (!basename.startsWith("__")) {
            var pa = fs.readdirSync(filepath);
            pa.forEach(function (filename) {
                var relpath = path.join(filepath, filename), info = fs.statSync(relpath);
                if (info.isDirectory()) {
                    console.log("dir: " + relpath);
                    readDirSync(relpath);
                } else if(!filename.startsWith("__")){
                    let refname = relpath.replace(/[\/]??(\..*)?$/, "").replace(/\\/g, "/"); // 去掉模块的后缀名
                    obj[refname.replace(new RegExp("^(\\./)?" + base + "/"), "")] = "./" + refname;
                }
            })
        }
    }
    return obj;
};
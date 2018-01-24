/**作为postcss的插件，依赖postcss xinzeng
 * Created by weikaiwei on 2017/12/15.
 */
let postcss = require('postcss'), Cssunit = require('./core');
module.exports = postcss.plugin(require("./package.json").name, function () {
  let args = arguments;
  return function (css, result) {
    let oldCssText = css.toString(),
      cssunit = new Cssunit(...args),
      newCssText = cssunit.parse(oldCssText);
    result.root = postcss.parse(newCssText);
  };
});

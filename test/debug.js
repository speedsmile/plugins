/**
 * Created by weikaiwei on 2018/1/29.
 */
var entry = require('../src/plugin/entry')("./*/*.js", {base: "test"});

console.log(entry.js)
console.log(entry.html)

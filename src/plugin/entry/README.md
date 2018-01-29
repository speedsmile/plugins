# 简化webpack的entry配置和入口html模板的配置
webpack的entry配置一般都是{ 打包生成模块: 源模块 }，有多个入口模块就得写多个键值关联对。
  
## 安装
    npm install --save-dev adv-entry
    或者
    npm i -D adv-entry

## 基本用法  
````javascript
var entry = require("adv-entry")("src/entry/**/*.js", options)
entry.js // 自动生成webpack的entry配置
entry.html // 自动生成webpack的plugins配置中html-webpack-plugin模板，与入口js一一对应
````
## 配置参数
### entry
入口js的路径。可以使用路径通配符
### options
* base：类似gulp中的base，生成的目标路径是从源路径的某一段之后开始的。
* ext String （默认".js"） 入口模块的默认后缀
* templates Object html模板  
  ````
  {  
     "入口模块": {  
        template: html模板。默认：pc.html；m：m.html——移动端  
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
  ````
* template Object templates模板参数的简单版，所有模板都使用一套配置，无法给所有模板单独指定title  
  ````
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
  ````

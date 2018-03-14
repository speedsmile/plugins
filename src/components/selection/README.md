# 基于Vue的下拉组件
## 包含组件
  1. Selection组件，下拉框和基本视图，作用同select
  2. SelectionOption组件，下拉选项，作用同option
  3. FocusPanel组件，下拉面板。点击Selection组件展开下拉面板，面板中包含SelectionOption。<br>
    点击下拉组件以外的区域，面板关闭，用的是焦点丢失原理，而不是简单点的点击事件。<br>
    因为当页面上存在iframe，对iframe内部的文档点击的事件是不可在一个文档对象中监听的。<br>
    焦点事件监听部分依赖zepto.js（jquery.js亦可）。
## props属性
| 属性名 | 类型 | 说明 | 默认值 |
| :--   | :-- | :-- | :--   |
| value | Array\|Object | 根据默认规则自动生成下拉选项<br>Array:[{valueFiled: 值, labelField: 显示的文本}...]<br>Object:{key:value ...}。自定义下拉选项的话参见默认的slot | 无 |
| value-field | String | 自动生成下拉遍历value中的数据时识别用作value字段的标识 | value |
| label-field | String | 自动生成下拉遍历value中的数据时识别用作显示下拉文本字段的标识 | value |
| placeholder | String | 没有选中项时的提示文字 | 无 |
| default-index | Number | 默认选中下拉的第几个选项，索引从0开始 | 无 |
| multiple | Boolean | 是否可以多选 | false |
| filterable | Boolean | 是否可以搜索 | true |
| filter-method | Function(keywords, callback) | 开启搜索功能后，自定义搜索方法。把搜索结果传入callback参数中，格式和value一致 | 内置根据输入关键字过滤下拉项的方法 |
| filter-placeholder | String | 搜索框显示的文字提示 | 请输入关键字 |
| filter-delay | Number（毫秒） | 搜索动作太过频繁，设置延时时间 | 300 |
| clearable | Boolean | 单选模式下是否可以清空下拉选项<br>多选模式下在最后出现一个叉叉一次性清除所有选中项 | false |
## 事件
| 事件名 | 说明 | 回调参数 |
| :--   | :-- | :--     |
| on-change | 选中项发生改变，一般是手动操作改变 | 1、所有选中的value值；2、所有选中的文本 |
| on-value-change | 选中的value发生变化时触发（只要数据发生改变就触发） | 1、所有选中的value值；2、所有选中的文本 |
## slots
| 名称 | 说明 |
| :-- | :-- |
| 默认 | 下拉选项<br>如果props中的value生成的下拉项不足以满足需求，可以自己实现下拉内容。推荐使用配套的selection-option组件，否则下拉项不能正确的响应功能事件 |

## selection-option组件
| props | 类型 | 说明 |
| :--  | :-- | :-- |
| value | Object | 下拉选项的value |
| label | String | 下拉选项的文本，不使用属性字段可以直接使用slot |

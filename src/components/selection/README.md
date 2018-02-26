# 基于Vue的下拉组件
## 包含组件
  1. Selection组件，下拉框和基本视图，作用同select
  2. SelectionOption组件，下拉选项，作用同option
  3. FocusPanel组件，下拉面板。点击Selection组件展开下拉面板，面板中包含SelectionOption。<br>
    点击下拉组件以外的区域，面板关闭，用的是焦点丢失原理，而不是简单点的点击事件。<br>
    因为当页面上存在iframe，对iframe内部的文档点击的事件是不可在一个文档对象中监听的。
## 事件
| 事件名 | 说明 | 回调参数 |
| :--| :-- | :-- |
| on-change | 选中项发生改变，一般是手动操作改变 | 1、所有选中的value值；2、所有选中的文本 |
| on-model-change | vmodel发生改变时触发。如果model映射label，改变value引起label变化，同样触发该事件 | vmodel改变后的值 |
| on-value-change | 选中的value发生变化时触发（只要数据发生改变就触发） | 1、所有选中的value值；2、所有选中的文本 |

# 更新日志

* 0.1.0  (2018-02-24)
  * 修复on-change事件回调第一个参数只有当前选择的下拉选项数据的bug，应该是所有选中的下拉数据。
  * 自定义selection-option只在selection组件第一次初始化的时候把数据绑定在selection组件上，无法适用于多次改变数据源的情况。
    这一版本开始，只要自定义selection-option组件发生变更，自动通知父级selection更新数据状态（下拉数据，选中数据）。
  * 修复使用自定义的下拉选项后，搜索功能失效的bug。
    原因：默认的下拉选项和搜索结果共用一个显示区域，使用自定义的下拉选项后覆盖了搜索结果的显示区域。
    修复：下拉选项和搜索结果分开使用2个显示区域。
  * 样式：下拉选项很多出现垂直滚动条时，搜索框不随着下拉内容滚动。
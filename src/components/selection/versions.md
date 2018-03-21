# 更新日志

* 0.1.0  (2018-02-24)
  * 修复on-change事件回调第一个参数只有当前选择的下拉选项数据的bug，应该是所有选中的下拉数据。
  * on-change和on-value-change回调中第一个参数是选中的values，第二个参数增加选中的labels（下拉项对应的文本）。
  * 自定义selection-option只在selection组件第一次初始化的时候把数据绑定在selection组件上，无法适用于多次改变数据源的情况。
    这一版本开始，只要自定义selection-option组件发生变更，自动通知父级selection更新数据状态（下拉数据，选中数据）。
  * 修复使用自定义的下拉选项后，搜索功能失效的bug。
    原因：默认的下拉选项和搜索结果共用一个显示区域，使用自定义的下拉选项后覆盖了搜索结果的显示区域。
    方案：下拉选项和搜索结果分开使用2个显示区域。
  * 修复直接设置下拉的选中值，下拉选项的选中状态不准确的bug。
  * 样式：下拉选项很多出现垂直滚动条时，搜索框不随着下拉内容滚动。

* 1.0.0  (2018-03-06)
  这一版的变化较大，不再支持value和label分别绑定2个数据模型上。
  如果有需要，在on-change或者on-value-chang事件上获得选中的value和label。
  * 删除props——context、label-model、value-model。
  * 重新定义props——model，影响v-model绑定值的数据格式
    "pair"，默认， v-model的数据格式是{valueField, labelField}（已实现）
    "value", v-model只绑定valueField（暂未实现）
    "label", v-model只绑定labelField（暂未实现）
    以上3种类型在多选模式下返回的都是数组格式，嵌套上述的类型
  * 新增属性：selectedValue、selectedLabel，用作内部保存选中的value和label
  * 去掉了Selection中耦合的iview校验模块的mixins，引用方应该在引用的业务中根据情况加入iview校验的逻辑
    ````javascript
      import selection from "selection";
      import option from "selection/option";

      /* 加入iview校验框架的行为通知，不使用iview框架不需要以下代码  start */
      import ForIView from 'selection/ForIView/ForIView';
      selection.mixins || (selection.mixins = []);
      selection.mixins.push(ForIView);
      /* 加入iview校验框架的行为通知  end */

      Vue.component(selection.name, selection);
      Vue.component(option.name, option);
    ````
  * FocusPanel组件把对jquery的依赖改成对zepto的依赖，减少体积

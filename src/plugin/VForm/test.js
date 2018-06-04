import $ from "jquery";

function get(item) {
  var vForm = this;
  //基本的表单元素使用循环一边获取它们的值一边校验。只要有一个校验错误，整个校验都是不通过的。按照需求需要继续把所有的错误都交验出来
  var $target, fieldName = item.name, values, get = item.get || item.as, vResult = 1;
  if (vForm.exclude.indexOf(fieldName) > -1) return;
  $target = vForm.getElement(item.hasOwnProperty("for") ? item.for : fieldName);
  var outParam = {vForm: this, $el: $target, data: formData, filedName: fieldName, item: item};
  if (type.isFunction(get)) { // 自定义取值方法
    values = get.call(outParam, $target, vForm, formData);
  } else { // 默认取值方法
    values = $target.map(function () {//表单元素radio和checkbox都是成组的，使用多个元素的方式来获取内容（对单组元素同样有效）
      var $this = $(this);
      if (vForm.isDisabled($this)) return null;
      switch (get) {
        case "radio":
        case "checkbox":
        case "i-radio":
        case "i-checkbox":
          if (this.checked) return this.value;
          break;
        case "value":
        case "input":
        case "val":
          return $this.val();//有些非input控件重写了jQuery的val方法，能够像value一样获取值。这种情况下只能使用val方法二不能使用value属性
        case "html":
          return $this.html();
        case "text":
          //获取元素内部文本的方法，火狐不支持innerText，取而代之的是textContent。避免兼容问题，统一使用jquery的text方法获取
          return $this.text();
      }
    }).toArray().join(",");
  }
  /**执行了元素的取值get配置后，检查outParam
   * outParam.returnValue 默认（无）；1: 继续按照默认流程执行；0: 跳过跳过接下来的所有步骤
   * outParam.validate 默认（无）；1: 执行校验；0: 跳过校验
   * */
  if (outParam.hasOwnProperty("returnValue") && !outParam.returnValue) return;
  values !== undefined && (values = vForm.dataConvert(values, item.type));
  /**字段值校验
   * 1、校验规则声明：允许在html结构中声明data-rule，同时也可以在js的字段定义中声明“rule”。2者都定义以js中定义的为准。
   * 2、默认使用全局校验器，如果定义了私有校验器，优先使用私有校验器。
   * ps:校验表单元素的内容是否满足自身声明的规则 data-rule的声明，data-rule可能是多个规则，可用分号或空格分隔，按照顺序依次校验
   * ps:被禁用（和被排除）的元素不用获取它的值，也不用校验（之前的错误提示也要清除）
   * */
  if ((!outParam.hasOwnProperty("validate") || outParam.validate) && !vForm.isDisabled($target)) {
    var rule = serializeRule(item.hasOwnProperty("rule") ? item.rule : $target.data("rule"));
    vResult = methods.validate.call(vForm, fieldName, values, rule, item.rules, formData, $target);
  }
  //校验通过，包装字段值
  if (vResult) {
    /**如果配置了字段包装器wrap，使用包装器对值进行处理，否则就使用默认的方式处理
     * 如果包装器没有返回结果，这个字段的值将不纳入表单获取的数据中
     * @param value 当前字段的值
     * @param data 当前所有字段的结果集对象
     * @return 最后经过包装器处理后的最终结果
     * */
    if (type.isFunction(item.wrap)) {
      values = item.wrap.call(outParam, values, formData);
    }
    //默认处理方式——忽略没有任何意义的undefined（null、""等其它空值都认为是有意义的）
    values !== undefined && (formData[fieldName] = values);
  }
}

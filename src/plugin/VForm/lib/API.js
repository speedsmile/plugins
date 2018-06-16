/**
 * Created by weikaiwei on 2018/6/4.
 */
import Iterator from "./Iterator";
import type from "@/plugin/util/type";
let methods = {
  /**把支持的各种规则声明结构转换成统一的结构
   * 支持：
   * 1、字符串，可以包含一个或者多个规则关键字，在rules中应该存在与关键字对应的实现方法
   * 2、function，直接实现一个匿名校验器
   * 3、数组，包含上述2种格式
   * 统一处理成数组格式，每个成员只包含单个的关键字或方法
   * 不符合格式的规则将被忽略
   * */
  serializeRule() {
    var arrRule = [];
    
    function _serialize(rule, arrRule) {
      //数组类型的规则，迭代分解每一个成员的规则
      if (type.isArray(rule)) {
        rule.forEach(function (rule) {
          _serialize(rule, arrRule);
        });
      }
      //字符串类型的规则尝试拆成单一规则，然后依次放到规则数组中
      else if (type.isString(rule)) {
        rule.split(/[\s;]+/).forEach(function (rule) {
          arrRule.push(rule)
        });
      } else {
        arrRule.push(rule);
      }
    }
    
    for (var i = 0, l = arguments.length; i < l; i++) {
      _serialize(arguments[i], arrRule);
    }
    return arrRule;
  },
  /**功能：校验一个元素的值是否满足其校验规则
   * @param value any 被校验的值
   * @param field Object 对象
   * 返回值：校验成功返回true，失败返回false
   * */
  validate(value, field, vName) {
    var vForm = this, rule, $errorTipTarget, r,
      fieldName = field.name,
      $target = this.getElement(field.hasOwnProperty("for") ? field.for : fieldName),
      /**字段值校验
       * 1、校验规则声明：允许在html结构中声明data-rule，同时也可以在js的字段定义中声明“rule”。2者都定义以js中定义的为准。
       * 2、默认使用全局校验器，如果定义了私有校验器，优先使用私有校验器。
       * ps:校验表单元素的内容是否满足自身声明的规则 data-rule的声明，data-rule可能是多个规则，可用分号或空格分隔，按照顺序依次校验
       * ps:被禁用（和被排除）的元素不用获取它的值，也不用校验（之前的错误提示也要清除）
       * */
      ruleNames = methods.serializeRule.call(this, field.hasOwnProperty("rule") ? field.rule : $target.data("rule")),
      // 私有的校验规则实现
      rules = field.rules || {},
      outParam = {vForm, target: $target[0], field, value};
    // 设计一个Promise链式执行器
    var iter = new Iterator(ruleNames);
    return new Promise(function loop(resolve, reject){
      if(iter.hasNext()){
        var ruleName = iter.next(), r = true;
        if (type.isPlainObject(ruleName)) {
          rule = ruleName;
          rule.validator = methods.formatRule.call(vForm, rule.validator, rules, vForm.rules);
        } else {
          rule = {validator: methods.formatRule.call(vForm, ruleName, rules, vForm.rules)};
        }
        // 纯对象格式{ name: "校验器的名称，多个校验器的时候可以指定校验某种。默认全部校验" }
        /**1、不指定校验名称，所有校验器依次执行
         * 2、指定了单个校验名称，和名称相等的校验器执行，不相等的跳过
         * */
        if (!vName || methods.contains(vName, rule.trigger)) {
          r = rule.validator(outParam);
        }
        if (r instanceof Promise) {
          r.then(function () {
            loop(resolve, reject);
          }).catch(function (msg) {
            $errorTipTarget = vForm.getElementTip(fieldName);
            reject(msg === undefined ? outParam.hasOwnProperty("message") ? outParam.message : rule.hasOwnProperty("message") ? rule.message : vForm.getTipMessage($errorTipTarget, ruleName) : msg);
          });
        } else if (!r) {
          $errorTipTarget = vForm.getElementTip(fieldName);
          reject(outParam.hasOwnProperty("message") ? outParam.message : rule.hasOwnProperty("message") ? rule.message : vForm.getTipMessage($errorTipTarget, ruleName));
        } else{
          loop(resolve, reject);
        }
      } else{
        resolve();
      }
    });
  },
  /**指定2个参数，判断a中的任一元素是否包含在b中
   * a和b都可以是数组和非数组类型
   * */
  contains(a, b){
    b = type.wrapArray(b);
    return type.wrapArray(a).some(item => b.indexOf(item) > -1);
  },
  formatRule(ruleName, value, rule1, rule2) {
    var type = this.type;
    //如果规则本身是个处理器（匿名处理器），按照处理器的规则进行校验
    if (type.isString(ruleName)) {
      //根据校验器的名称获取对应的校验规则，优先使用私有校验器
      return rule1[ruleName] || rule2[ruleName] || function () {
        return true
      }
    }
    /**自定义校验规则
     * @return Object {
                           *      result: 校验结果 true: 成功, false: 失败,
                           *      tip: 触发的tip提示配置（1个校验规则可能有多中提示结果，根据返回的关键字找到最合适的配置提示）
                           *      message: 具体的提示信息，忽略tip
                           * }
     * @return Boolean（非Object） 校验成功/失败
     * */
    else if (type.isFunction(ruleName)) {
      return ruleName;
    } else if (ruleName instanceof RegExp) {
      return function ({value}) {
        return ruleName.test(value)
      };
    } else if (!ruleName) {
      return function () {
        return true
      }
    } else {
      return ruleName;
    }
  },
  setData(v) {
    var vForm = this;
    //设置所有表单的值
    this.fields.forEach(function (item) {
      var fieldName = item.name,
        value = vForm.dataConvert(v[fieldName] === null || v[fieldName] === undefined ? item.defaultValue : v[fieldName], item.type),
        $target = vForm.getElement(fieldName), set = item.set || item.as,
        outParam = {vForm, $target, fieldName, item, value};
      if (typeof set == "function") {
        set(outParam);
      } else {
        switch (set) {
          case "value":
          case "input":
          case "val"://文本框，编辑的时候如果是个空值，默认保持文本框中原有的值（默认值）
            value && $target.val(value);
            break;
          case "radio":
            $target.each(function () {
              $(this).prop("checked", $(this).val() === value);
            });
            break;
          case "checkbox"://checkbox是复选值，逗号分隔格式
            var arrValue = value.split(",");
            $target.each(function () {
              $(this).prop("checked", arrValue.indexOf($(this).val()) > -1);
            });
            break;
          case "i-radio":
            $target.each(function () {
              $(this).iCheck($(this).val() === value ? "check" : "uncheck");
            });
            break;
          case "i-checkbox"://checkbox是复选值，逗号分隔格式
            var arrValue = value.split(",");
            $target.each(function () {
              $(this).iCheck(arrValue.indexOf($(this).val()) > -1 ? "check" : "uncheck");
            });
            break;
          case "html":
            $target.html(value);
            break;
          case "text":
            $target.text(value);
            break;
        }
      }
    });
  },
  /**获取表单元素数据的方法
   * @return 表单校验失败，返回false。成功返回{key: value}
   * */
  getData() {
    var formData = {};
    //基本的表单元素使用循环一边获取它们的值一边校验。只要有一个校验错误，整个校验都是不通过的。按照需求需要继续把所有的错误都交验出来
    this.fields.forEach(item => {
      let values = this.getElementData(item), fieldName = item.name;
      formData[fieldName] = values;
    });
    return formData;
  }
};
export default methods;

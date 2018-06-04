/**VForm --> Validate Form  使用amd规范编写，依赖jQuery
 * 支持函数调用和new操作符2种方式来生成VForm对象
 * 在指定的DOM作用域内（默认是根元素）：
 * 1、配置：指定DOM作用域，指定所有的元素数据和dom的映射关系
 * 2、赋值：按照指定的规则给元素映射value；
 * 3、取值：按照规则获取元素们的value集合，形成一个对象。过程中会根据元素配置的规则进行校验，自动生成错误提示。
 * 附带一个form提交的方法：有些情况下不能使用ajax方式提交数据
 * Created by weikaiwei on 2016/10/27.
 */
import type from "@/plugin/util/type";
import $ from "jquery";

/**支持使用函数调用的方式和new方式来生成一个VForm对象
 * */
export default function (o = {}) {
  var {getData} = o;
  
  /**把支持的各种规则声明结构转换成统一的结构
   * 支持：
   * 1、字符串，可以包含一个或者多个规则关键字，在rules中应该存在与关键字对应的实现方法
   * 2、function，直接实现一个匿名校验器
   * 3、数组，包含上述2种格式
   * 统一处理成数组格式，每个成员只包含单个的关键字或方法
   * 不符合格式的规则将被忽略
   * */
  function serializeRule() {
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
      } else if (type.isFunction(rule)) {
        arrRule.push(rule);
      }
    }
    
    for (var i = 0, l = arguments.length; i < l; i++) {
      _serialize(arguments[i], arrRule);
    }
    return arrRule;
  }
  
  var vForm = {
      $scope: $(document),
      /**数组类型，所有的字段声明。以下是每个字段的配置说明：
       * name：字段名称，dom结构中应该有一个name等于这个配置的dom元素。特殊情况下也可以没有，比如一个日期元素映射2个字段（开始时间、结束时间），一个下拉也可能映射value和text
       * get：字段值的get访问器。可以使用内置的get规则（"value"、"text"、"html"、"input"等等），也可以使用配置函数实现自定义的取值方式
       * set: 字段值的set访问器。可以使用内置的set规则（"value"、"text"、"html"、"input"等等），也可以使用配置函数实现自定义的设值方式
       * as：字段的取值/设置值的规则。如果字段的取值和设置值的方式都一样，比如输入框都是value，就不需要同时设置get和set字段的类型，笼统的使用as配置即可。get、set中任何一个，没有声明，都会自动使用as的声明
       * type：字段值的类型。dom中的值默认都是字符串类型，在使用get/set的时候会根据声明转换成对应的类型。
       * rule：校验规则。允许在html结构中声明data-rule，同时也可以在js的字段定义中声明“rule”。2者都定义以js中定义的为准。
       *       规则可以是一个key（字符串，也可以是一串以空白字符分隔的多个规则id），对应的实现部分可以在全局的rules中，也可以在字段的私有rules中。
       *       规则可以是一个直接实现检验的方法（匿名处理器），返回真值表示校验通过，否则表示失败。例：
       *          @param value 当前字段的值
       *          @param fieldName 当前字段的名称
       *          @param data 其它已经通过检验的字段
       *          @return boolean
       *          函数中的this引用: {vForm: , value: 同上, filedName: 同上, data: 同上, tip: 方法体中设置使用的tip提示关键字, sg: 方法体m中设置的提示语，优先errorTip}
       *          function(v){}
       *       规则可以是一个数组，每个成员对象都只能是上述2种类型。
       * rules：rule字段包含规则的key，rules中包含于key对应的具体校验方法。支持正则表达式和function校验器（同rule中的function规则）。
       * wrap：包装处理器function。get --> rule --> rules --> wrap，校验成功后可以对字段值作进一步处理，比如说一个元素映射多个字段，元素自身可以不被包含到表单的data中。
       *      @param value 当前字段的值（已经通过了校验）
       *      @param data 按照声明顺序，当前已经通过校验的字段集合对象
       *      this {vForm: , data: 同data, filedName: 当前字段的名称, item: 字段声明的field配置}
       *      最好不要改变this中的内容
       *      function(value, data){}
       *
       * */
      fields: [],
      /**内置的一些校验规则
       * */
      rules: {
        // 正则表达式不能校验出null和undefined
        require: function (v) {
          return v != null && /\S+/.test(v.toString());
        },
        text: /^[\u4e00-\u9fa5\w]+$/,
        
        //所有校验器验证空字符串的时候都返回true，表示可以没有值，如果有的话就必须正确。必需有值请配合使用require规则。
        //数字，正负实数和0
        number: /^([+-]?\d+?(\.\d*)?)?$/,
        //正数（positive）pnumber
        //负数（negative）nnumber
        //非负数，无符号实数（0和正数）unumber
        //非正数（0和负数）mnumber
        
        //整数
        int: /^([+-]?\d+)?$/,
        //正整数（positive integer）
        pint: function (v) {
          return v === "" || /^\d+$/.test(v) && Number(v) > 0;
        },
        //负整数（negative integer）
        nint: function (v) {
          return v === "" || /^-\d+$/.test(v) && Number(v) < 0;
        },
        //非负整数，无符号整数（0和正整数）
        uint: function (v) {
          return v === "" || /^\d+$/.test(v) && Number(v) >= 0;
        },
        //非正整数（0和负整数）
        mint: function (v) {
          return v === "" || /^-\d+$/.test(v) && Number(v) <= 0;
        }
      },
      errorTarget: null,//数组。校验的时候存放所有校验失败的dom元素
      _exclude: null,//校验的时候设置一些可以不用校验的dom元素
      set exclude(v) {
        if (type.isArray(v)) {
          this._exclude = v;
        } else if (type.isString(v)) {
          this._exclude = [v];
        } else {
          this._exclude = [];
        }
      },
      get exclude() {
        return this._exclude || [];
      },
      /**让浏览器定位到指定的元素上
       * @param e 被定位的元素
       * number类型，获取与fields中声明的顺序与指定索引相同的元素；
       * string类型，默认定位到第一个校验不通过的元素身上
       * */
      locateElement: function (e) {
        var vForm = this, isNumber = type.isNumber(e), isString = type.isString(e);
        if (isString || isNumber) {
          this.fields && this.fields.some(function (item, i) {
            if (isNumber && i == e || item.name == e) {
              e = vForm.getElement(item.name)[0];
              return true;
            }
          });
        }
        //找不到合适的元素就不定位
        if (e) {
          e.scrollIntoViewIfNeeded ? e.scrollIntoViewIfNeeded() : e.scrollIntoView();
          //如果错误元素可以聚焦，并且非禁用和只读，让该元素获得焦点
          vForm.isDisabled($(el)) && !$(e).prop("readonly") && type.isFunction(e.focus) && e.focus();
        }
      },
      getFieldNames(names) {
        if(names){
          type.isArray(names) || (names = [names]);
        }else{
          names = this.fields.map(item => item.name);
        }
        return names
      },
      /**数据的类型转换器
       * */
      dataConvert: function (value, vtype) {
        switch (vtype) {
          case "number":
            return /^[+-]?\d+?(\.\d*)?$/.test(value) ? Number(value) : value;
          case "boolean":
            return !!value;
          case "string":
          default:
            return value == undefined ? value : value.toString();
        }
      },
      /**校验指定的元素
       * @param name 被校验的字段名称
       * @return Promise 校验通过进入then，失败进入catch
       * */
      validate: function (names) {
        var allFields = this.fields, fields = [];
        if(names){
          type.isArray(names) || (names = [names]);
          names.forEach(name => {
            allFields.some(field => field.name === name && (fields.push(field), true));
          });
        } else {
          fields = allFields;
        }
        return new Promise((resolve, reject) => {
          //基本的表单元素使用循环一边获取它们的值一边校验。只要有一个校验错误，整个校验都是不通过的。按照需求需要继续把所有的错误都交验出来
          fields.forEach(function (item) {
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
          });
        });
      }
    },
    // 默认行为，可重写
    defaults = {
      /**获取指定的元素
       * @param name String|[String] 元素的字段标识
       * @return $(元素dom)
       * */
      getElement(name) {
        if (name) {
          type.isArray(name) || (name = [name]);
        } else { // 不指定元素名称就是获取全部的元素
          name = this.fields.map(item => item.name);
        }
        var $scope = this.$scope, $array = $();
        name.forEach(function (item) {
          $array = $array.add($scope.find('[name=' + item + ']'));
        });
        return $array;
      },
      /**获取指定的元素的错误提示dom元素
       * @param name String|[String] 元素的字段标识
       * @return $(元素的错误提示dom)
       * */
      getElementTip(name) {
        type.isArray(name) || (name = [name]);
        return this.getElement(name.map(function (item) {
          return item + '-error';
        }));
      },
      /**获取错误提示的内容
       * @param item String|$(dom)
       *  String: 错误提示所在的元素的名称
       * @param tipName String 提示语的标识
       * */
      getTipMessage(item, tipName) {
        var tipText;
        //优先查找error-tip-规则名称所对应的错误提示语，如果没有，则使用error-tip属性上的提示语，如果没有则不做提示语的覆盖处理（当只有一种校验情况的时候，直接把提示语写在文档内部，不需要匹配）
        (tipText = item.attr("error-tip-" + tipName)) === undefined && (tipText = $errorTipTarget.attr("error-tip"));
        return tipText;
      },
      /**TODO 获取指定元素的值
       * @param item Object 指定的元素的field配置项
       * @param formData Object|非必须
       * */
      getElementData(item, formData = {}) {
        //基本的表单元素使用循环一边获取它们的值一边校验。只要有一个校验错误，整个校验都是不通过的。按照需求需要继续把所有的错误都交验出来
        var vForm = this, $target, fieldName = item.name, values, get = item.get || item.as;
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
        return values
      },
      /**显示/隐藏错误提示的方法
       * @param $el jQueryObject $(dom)
       * @param show Boolean true：显示；false：隐藏；默认：toggle（显示->隐藏，隐藏->显示）
       * */
      toggleTip($el, show) {
        $el[show ? "removeClass" : "addClass"]("hide");
      },
      /**判断元素是否禁用的方法
       * */
      isDisabled(el) {
        return el.prop("disabled") || el.attr("disabled") !== undefined;
      }
    };
  /**可重写的方法
   * getData  先调用validate方法，通过后再返回表单元素的正确数据
   * @param
   * */
  var methods = {
    setData(v) {
      var vForm = this;
      //设置所有表单的值
      this.fields.forEach(function (item) {
        var name = item.name,
          value = vForm.dataConvert(v[name] === null || v[name] === undefined ? item.defaultValue : v[name], item.type),
          $dom = vForm.getElement(name), set = item.set || item.as, outParam = {};
        if (typeof set == "function") {
          set.call(outParam, $dom, value, vForm, item);
        } else {
          switch (set) {
            case "value":
            case "input":
            case "val"://文本框，编辑的时候如果是个空值，默认保持文本框中原有的值（默认值）
              value && $dom.val(value);
              break;
            case "radio":
              $dom.each(function () {
                $(this).prop("checked", $(this).val() === value);
              });
              break;
            case "checkbox"://checkbox是复选值，逗号分隔格式
              var arrValue = value.split(",");
              $dom.each(function () {
                $(this).prop("checked", arrValue.indexOf($(this).val()) > -1);
              });
              break;
            case "i-radio":
              $dom.each(function () {
                $(this).iCheck($(this).val() === value ? "check" : "uncheck");
              });
              break;
            case "i-checkbox"://checkbox是复选值，逗号分隔格式
              var arrValue = value.split(",");
              $dom.each(function () {
                $(this).iCheck(arrValue.indexOf($(this).val()) > -1 ? "check" : "uncheck");
              });
              break;
            case "html":
              $dom.html(value);
              break;
            case "text":
              $dom.text(value);
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
      this.toggleTip(this.$scope.find('.error-tip'), false);
      var errorTarget = [];
      //基本的表单元素使用循环一边获取它们的值一边校验。只要有一个校验错误，整个校验都是不通过的。按照需求需要继续把所有的错误都交验出来
      this.fields.forEach(item => {
        let values = this.getElementData(item, formData),
          fieldName = item.name,
          vResult = 1, outParam = {vForm: this, data: formData, fieldName, item};
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
        }
        //默认处理方式——忽略没有任何意义的undefined（null、""等其它空值都认为是有意义的）
        value !== undefined && (formData[item.name] = value);
      });
      return formData;
    },
    /**功能：校验一个元素的值是否满足其校验规则
     * @param fieldName 字段名称
     * @param value 被校验的值
     * @param ruleNames 校验规则的key
     * @param rules 私有的校验规则实现
     * @param formData 这里不做任何处理，仅仅当做参数传递给自定义校验器
     * @param $target 被校验的dom元素
     * 返回值：校验成功返回true，失败返回false
     * */
    validate: function (fieldName, value, ruleNames, rules, formData, $target) {
      var rule, ruleName, outParam, $errorTipTarget, tipName, tipText, r;
      rules || (rules = {});
      type.isArray(ruleNames) || (ruleNames = serializeRule(ruleNames));
      for (var i = 0, l = ruleNames.length; i < l; i++) {
        r = true;
        outParam = {vForm: this, data: formData, filedName: fieldName};
        tipName = ruleName = ruleNames[i];
        //如果规则本身是个处理器（匿名处理器），按照处理器的规则进行校验
        if (type.isFunction(ruleName)) {
          rule = ruleName;
          tipName = "";
          r = rule.call(outParam, value, fieldName, formData);
        } else {
          //根据校验器的名称获取对应的校验规则，优先使用私有校验器
          rule = rules[ruleName] || this.rules[ruleName];
          if (rule) {
            /**自定义校验规则
             * @return Object {
                             *      result: 校验结果 true: 成功, false: 失败,
                             *      tip: 触发的tip提示配置（1个校验规则可能有多中提示结果，根据返回的关键字找到最合适的配置提示）
                             *      tipMsg: 具体的提示信息，忽略tip
                             * }
             * @return Boolean（非Object） 校验成功/失败
             * */
            if (typeof rule == "function") {
              r = rule.call(outParam, value, fieldName, formData);
            } else if (rule instanceof RegExp) {
              r = rule.test(value);
            }
          }
        }
        if (!r) {
          $errorTipTarget = this.getElementTip(fieldName);
          if (outParam.hasOwnProperty("msg")) {
            tipText = outParam.msg;
          } else {
            outParam.tip && (tipName = outParam.tip);
            //优先查找error-tip-规则名称所对应的错误提示语，如果没有，则使用error-tip属性上的提示语，如果没有则不做提示语的覆盖处理（当只有一种校验情况的时候，直接把提示语写在文档内部，不需要匹配）
            tipText = this.getTipMessage($errorTipTarget);
          }
          //如果没有与配置对应的tip，$errorTipTarget内部可能就存在错误提示（简写版）
          tipText !== undefined && $errorTipTarget.text(tipText);
          //显示错误提示标签
          this.toggle($errorTipTarget, true);
          return false;
        }
      }
      return true;
    }
  };
  
  /**特殊方法需要重写
   * getData
   * */
  var special = {
    /**获取表单所有元素值方法
     * 1.1、会跳过禁用的元素
     * 1.2、对非禁用的元素进行规则校验
     * 1.3、如果不是所有元素都校验通过了：
     * 1.3.1、定位到第一个校验不通过的元素，显示错误提示
     * 1.3.2、整体结果返回false
     * 1.4、如果所有元素都通过校验
     * 1.4.1、返回最终结果
     *
     * 2.1、如果定义了取值的方法，先执行默认方法获得元素的值，1.1，1.2
     * 2.2、把2.1取出来的值回传给自定义的取值方法，然后自定义取值方法返回一个配置结果
     * 2.3.1、如果没有返回配置结果，默认执行1.3，1.4
     * 2.3.2、配置结果 === false，整体方法返回false
     * 2.3.3、配置结果 {validate: 0}，跳过1.3.1
     * */
    getData() {
      var data = methods.getData.apply(this, arguments), returnValue, errorEl;
      //如果自定义了取值的方法，把默认取值的结果回传给自定义方法
      if (getData) {
        returnValue = getData.call(this, data);
        if (returnValue === false) return false;
      }
      if (!returnValue || returnValue.validate) {
        //默认定位到第一个校验不通过的元素上
        if (this.errorTarget && (errorEl = this.errorTarget[0])) {
          this.locateElement(errorEl);
          return false;
        }
      }
      return data;
    }
  };
  Object.assign(vForm, defaults, o, special);
  return vForm;
}

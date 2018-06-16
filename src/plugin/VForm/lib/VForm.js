/**VForm --> Validate Form  使用amd规范编写，依赖jQuery
 * 支持函数调用和new操作符2种方式来生成VForm对象
 * 在指定的DOM作用域内（默认是根元素）：
 * 1、配置：指定DOM作用域，指定所有的元素数据和dom的映射关系
 * 2、赋值：按照指定的规则给元素映射value；
 * 3、取值：按照规则获取元素们的value集合，形成一个对象。过程中会根据元素配置的规则进行校验，自动生成错误提示。
 * 附带一个form提交的方法：有些情况下不能使用ajax方式提交数据
 * Created by weikaiwei on 2016/10/27.
 */
/**TODO 每个field配置一个成功和失败的回调，用于捕获单个field经过完全校验后的动作
 * */
import methods from "./API";
import type from "@/plugin/util/type";
import Iterator from "./Iterator";
/**支持使用函数调用的方式和new方式来生成一个VForm对象
 * */
export default function (o = {}) {
  let $ = o.$ || window.$ || window.jQuery || window.Zepto,
    onE = o.on || {};
  let vForm = {
      $,
      type,
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
        require: function ({value}) {
          return value != null && /\S+/.test(value.toString());
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
        pint: function ({value}) {
          return value === "" || /^\d+$/.test(value) && Number(value) > 0;
        },
        //负整数（negative integer）
        nint: function ({value}) {
          return value === "" || /^-\d+$/.test(value) && Number(value) < 0;
        },
        //非负整数，无符号整数（0和正整数）
        uint: function ({value}) {
          return value === "" || /^\d+$/.test(value) && Number(value) >= 0;
        },
        //非正整数（0和负整数）
        mint: function ({value}) {
          return value === "" || /^-\d+$/.test(value) && Number(value) <= 0;
        }
      },
      /**让浏览器定位到指定的元素上
       * @param e 被定位的元素
       * number类型，获取与fields中声明的顺序与指定索引相同的元素；
       * string类型，默认定位到第一个校验不通过的元素身上
       * */
      locateElement: function (e) {
        let vForm = this, isNumber = type.isNumber(e), isString = type.isString(e);
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
        if (names) {
          type.isArray(names) || (names = [names]);
        } else {
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
       * @param names String|[String] 被校验的字段名称
       * @return Promise 校验通过进入then，失败进入catch
       * */
      validate: function (names, ruleName) {
        let allFields = this.fields, fields = [], vForm = this, formData = {},
          invalidFields = [], validFields = [];
        if (names) {
          type.isArray(names) || (names = [names]);
          names.forEach(name => {
            allFields.some(field => field.name === name && (fields.push(field), true));
          });
        } else {
          fields = allFields;
        }
        function valid(vForm, value, field, target){
          let fieldName = field.name;
          //校验通过，包装字段值
          vForm.toggleTip(fieldName, false);
          /**如果配置了字段包装器wrap，使用包装器对值进行处理，否则就使用默认的方式处理
           * 如果包装器没有返回结果，这个字段的值将不纳入表单获取的数据中
           * @param value 当前字段的值
           * @param data 当前所有字段的结果集对象
           * @return 最后经过包装器处理后的最终结果
           * */
          if (type.isFunction(field.wrap)) {
            let outParam = {vForm, value, field, target};
            value = field.wrap(outParam);
          }
          formData[fieldName] = value;
          validFields.push(fieldName);
        }
        function invalid(vForm, field, msg){
          let fieldName = field.name;
          vForm.toggleTip(fieldName, true, msg);
          invalidFields.push(fieldName);
        }
        var scope = {vForm};
        var iter = new Iterator(fields);
        //基本的表单元素使用循环一边获取它们的值一边校验。只要有一个校验错误，整个校验都是不通过的。默认把所有字段的错误都校验出来
        return new Promise(function loop(resolve, reject){
            if(iter.hasNext()){
              let field = iter.next(), fieldName = field.name,
                $target = vForm.getElement(field.hasOwnProperty("for") ? field.for : fieldName),
                value = vForm.getElementData(field),
                vResult = true;
              if(!vForm.isDisabled($target)){
                vResult = methods.validate.call(vForm, value, field, ruleName);
              }
              if(vResult instanceof Promise){
                vResult.then(function () {
                  valid(vForm, value, field, $target[0]);
                  loop(resolve, reject);
                }).catch(function (msg) {
                  invalid(vForm, field, msg);
                  loop(resolve, reject);
                });
              }else if(vResult === true){
                valid(vForm, value, field, $target[0]);
                loop(resolve, reject);
              }else{
                invalid(vForm, field, vResult);
                loop(resolve, reject);
              }
            } else{
              // 指定的字段全部校验通过，执行resolve；否则执行reject
              if (!invalidFields.length) {
                scope.formData = formData;
                scope.validFields = validFields;
                resolve(scope);
              } else {
                scope.invalidFields = invalidFields;
                reject(scope);
              }
            }
        }).then(function (scope) {
          onE.valid && onE.valid(scope);
          return scope
        }).catch(function (scope) {
          onE.invalid && onE.invalid(scope);
          return Promise.reject(scope)
        });
      }
    },
    // 默认行为，可重写
    overrides = {
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
        let $scope = this.$scope, $array = $();
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
       * @param $el String|$(dom)
       *  String: 错误提示所在的元素的名称
       * @param tipName String 提示语的标识
       * */
      getTipMessage($el, tipName) {
        let tipText;
        //优先查找error-tip-规则名称所对应的错误提示语，如果没有，则使用error-tip属性上的提示语，如果没有则不做提示语的覆盖处理（当只有一种校验情况的时候，直接把提示语写在文档内部，不需要匹配）
        (tipText = $el.attr("error-tip-" + tipName)) === undefined && (tipText = $el.attr("error-tip"));
        //如果属性上没有错误提示，错误提示可能就直接在该元素的内部节点中
        return tipText;
      },
      /**TODO 获取指定元素的值
       * @param field Object 指定的元素的field配置项
       * */
      getElementData(field) {
        type.isString(field) && (field = {name: field});
        //基本的表单元素使用循环一边获取它们的值一边校验。只要有一个校验错误，整个校验都是不通过的。按照需求需要继续把所有的错误都交验出来
        let vForm = this, fieldName = field.name, values, get = field.get || field.as,
          $target = vForm.getElement(field.hasOwnProperty("for") ? field.for : fieldName),
          outParam = {vForm: this, target: $target[0], field};
        if (type.isFunction(get)) { // 自定义取值方法
          values = get.call(outParam);
        } else { // 默认取值方法
          values = $target.map(function () {//表单元素radio和checkbox都是成组的，使用多个元素的方式来获取内容（对单组元素同样有效）
            let $this = $(this);
            if (vForm.isDisabled($this)) return null;
            switch (get) {
              case "radio":
              case "checkbox":
              case "i-radio":
              case "i-checkbox":
                if (this.checked) return this.value;
                break;
              case "html":
                return $this.html();
              case "text":
                //获取元素内部文本的方法，火狐不支持innerText，取而代之的是textContent。避免兼容问题，统一使用jquery的text方法获取
                return $this.text();
              case "value":
              case "input":
              case "val":
              default:
                return $this.val();//有些非input控件重写了jQuery的val方法，能够像value一样获取值。这种情况下只能使用val方法二不能使用value属性
            }
          }).toArray().join(",");
        }
        return values !== undefined ? vForm.dataConvert(values, field.type) : values;
      },
      /**显示/隐藏错误提示的方法
       * @param $el jQueryObject|String
       * @param show Boolean true：显示；false：隐藏；默认：toggle（显示->隐藏，隐藏->显示）
       * @param text String 显示错误提示时指定提示内容
       * */
      toggleTip($el, show, text) {
        ($el instanceof $) || ($el = this.getElementTip($el));
        if (text !== undefined) {
          $el.html(text);
        }
        $el[show ? "show" : "hide"]();
      },
      isInvalid(name){
      
      },
      /**判断元素是否禁用的方法
       * */
      isDisabled(el) {
        return el.prop("disabled") || el.attr("disabled") !== undefined;
      }
    };
  $.extend(vForm, overrides, o);
  return vForm;
}

<template>
  <div class="selection"
       :class="{disabled: mode == 0, expand: status == 'expand', multiple: multiple, single: !multiple }">
    <!-- 显示区域，选中的下拉项 -->
    <div class="selection-area" @click="toggle">
      <!-- 选中的下拉选项 -->
      <ul class="selection-list" v-if="selectedItems && selectedItems.length">
        <li v-for="item in selectedItems" class="selection-item">
          <a href="javascript:void(0)">{{item[labelField]}}</a>
          <i class="icon-deselect" @click.stop="removeSelection(item)">&times;</i>
        </li>
      </ul>
      <div class="placeholder" v-else v-text="placeholder"></div>
      <i class="icon-clear" @click.stop="removeAll"
         v-if="clearable!==false&&selectedItems&&selectedItems.length">
        <i class="icon">&times;</i>
      </i>
      <i class="icon-drop"></i>
    </div>
    <!-- 下拉区域 -->
    <focus-panel ref="list" class="drop-list">
      <slot>
        <!-- 搜素区域 -->
        <div class="search-group" v-show="filterable">
          <!-- 搜索框 -->
          <div class="input-group">
            <input type="text" class="search-input" v-model="searchKeywords" :placeholder="filterPlaceholder">
            <i class="input-group-btn fa fa-search"></i>
          </div>
          <!-- 关键字搜索结果列表（焦点面板），二维数组 -->
          <!--<focus-panel ref="resultList" class="drop-list full-width">-->
          <!--<ul class="search-result list-group">-->
          <!--<li v-for="item in searchResult" :class="{selected: isSelected(item)}" @click="itemClick(item)">-->
          <!--<a class="link" href="javascript:;">{{item[labelField]}}</a>-->
          <!--</li>-->
          <!--</ul>-->
          <!--</focus-panel>-->
        </div>
        <!-- 下拉列表区域 -->
        <ul class="list" v-show="!searchKeywords">
          <li v-for="item in items" :class="{selected: isSelected(item)}" @click="itemClick(item)">
            <a class="link" href="javascript:;">{{item[labelField]}}</a>
          </li>
        </ul>
        <ul class="list" v-show="searchKeywords">
          <li v-for="item in searchResult" :class="{selected: isSelected(item)}" @click="itemClick(item)">
            <a class="link" href="javascript:;">{{item[labelField]}}</a>
          </li>
        </ul>

      </slot>
    </focus-panel>
  </div>
</template>
<script>
  import "./selection.less";
  import focusPanel from "./focusPanel.vue";

  // 配合iview的Form组件的校验框架，需要引入该ForIView模块。不使用iview则不需要引用此模块
  import ForIView from './ForIView/ForIView';
  export default {
    name: "selection",
    mixins: [ForIView],
    components: {focusPanel},
    model: {
      prop: 'vModel',
      event: 'on-change'
    },
    data () {
      return {
        status: "collapse",//当前状态：expand、collapse（默认）
        items_: [],
        selectedItems_: [],
        searchKeywords_: "",
        searchResult_: []
      }
    },
    props: {
      //下拉组件的模式状态：0，禁用；1，正常可编辑（默认）
      mode: {default: 1},
      placeholder: {type: String, default: ""},
      valueField: {type: String, default: "key"},
      labelField: {type: String, default: "text"},
      // 下拉数据
      value: {
        type: [Array, Object],
        default: null
      },
      // 选中的下拉数据——和v-model（用户数据）绑定一起
      vModel: {default: null},
      /**下拉控件选中项的label和value的映射方式
       * 默认：使用v-model，格式为{labelField: , valueField}，多选状态下返回数组
       label：label单独映射一个字段，参数：{field: "字段名称|String", context: 映射字段的上下文对象（反向修改使用）}
       value：value单独映射一个字段，参数：{field: "字段名称|String", context: 映射字段的上下文对象（反向修改使用）}
       * */
      map: {
        default: null
      },
      /**v-model指令映射字段
       "label": 映射到label字段；
       "value"默认: 映射到value字段；
       其它: {label, value},多选模式下[{label, value}]
       * */
      model: {default: "value"},
      // 是否多选
      multiple: {default: false},
      // 是否显示清除
      clearable: {default: false},
      /**对下拉数据筛选
       * 假值：关闭搜索功能；
       * 真值（默认）：本地搜索，只对下拉中的数据新进筛选；
       * "remote"：远程搜索
       * */
      filterable: {default: 1},
      // 搜索的方法，默认使用本地搜索的方法
      filterMethod: {
        type: Function
      },
      filterPlaceholder: {type: String, default: "请输入关键字"},
      // 连续输入搜索字符停顿N毫秒后认为输入结束，然后开始执行搜索
      filterDelay: {type: Number, default: 300}
    },
    computed: {
      // 下拉数据，对应prop——value
      items: {
        get: function () {
          return this.items_;
        },
        set: function (v) {
          if (v != this.items_) {
            this.items_ = this._convert(v);
          }
        }
      },
      // 下拉选中数据，对应v-model和prop——vModel
      selectedItems: {
        get: function () {
          return this.selectedItems_;
        },
        set: function (v) {
          if (v != this.selectedItems_) {
            var selectedItems = this._convert(v);
            this.selectedItems_ = this.multiple ? selectedItems : selectedItems.slice(0, 1);
          }
        }
      },
      // 输入关键字进行搜索
      searchKeywords: {
        get: function () {
          return this.searchKeywords_;
        },
        set: (function () {
          var timeoutId;
          return function (v) {
            var vue = this;

            function search(v) {
              v = $.trim(v);
              /**下拉搜索方法，默认本地数据搜索
               * 本地搜索：从下拉中已有的数据项中进行关键字过滤
               * 远程搜索：需提供具体的实现方法，在回调中返回搜索结果
               * */
              function cb(result) {
                vue.searchResult = result;
              }

              if (this.filterable) {
                this.filterMethod ? this.filterMethod(v, cb) : this.localFilter();
              }
            }

            this.searchKeywords_ = v;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function () {
              search.call(vue, v)
            }, this.filterDelay)
          }
        }())
      },
      // 搜索结果列表
      searchResult: {
        get(){
          return this.searchResult_
        },
        set(v){
          this.searchResult_ = this._convert(v);
        }
      }
    },
    watch: {
      value: function () {
        this.items = this.value
      },
      vModel: function () {
        this.model == "label" ? this._setSelectedItems("label") : this._setSelectedItems();
      }
    },
    methods: {
      // 设置选中项
      setSelection(items){
        items = this._convertArray(items);

      },
      // 添加选中项
      addSelection (item) {
        var selections = this.selectedItems;
        if (this.multiple) {
          let valueField = this.valueField;
          //不能重复添加同一个选中项
          selections.every(function (i) {
            return item[valueField] != i[valueField];
          }) && selections.push(item);
        } else {
          selections = [item];
        }
        let value = this.multiple ? selections : selections[0];
        let {model} = this._updateModels(value);
        this.$emit("on-change", model, {component: this, des: "add"});
      },
      //移除选中项
      removeSelection (item) {
        if (this.mode == 1) {
          let selections = this.selectedItems, valueField = this.valueField;
          selections.some(function (i, index) {
            if (item[valueField] == i[valueField]) {
              selections.splice(index, 1);
              return true;
            }
          });
          let value = this.multiple ? (selections.length ? selections : null) : selections[0];
          let {model} = this._updateModels(value);
          this.$emit("on-change", model, {component: this, des: "remove"});
        }
      },
      // 移除全部选项
      removeAll(){
        let {model} = this._updateModels(this.selectedItems = null);
        this.$emit("on-change", model, {component: this, des: "remove"});
      },
      //展开下拉，定位搜索框
      expand () {
        if (this.mode == 1 && this.status != "expand") {
          this.status = "expand";
          this.$refs.list.expand(1);
          this.$emit("on-open");
        }
      },
      //状态改为收回状态，下拉的收回状态由下拉对象自己处理
      collapse () {
        if (this.mode == 1) {
          if (this.status != "collapse") {
            this.status = "collapse";
            //下拉面板关闭、搜索结果面板关闭后重置输入内容和结果列表
            this.searchResult = null;
            this.searchKeywords_ = null;
            this.$refs.list.collapse(1);
            this.$emit("on-close");
          }
        }
      },
      toggle () {
        if (this.mode == 1) {
          this.status == "collapse" ? this.expand() : this.collapse();
        }
      },
      /**列表项的点击选择事件
       * @param item，点击项。item.type==1，不选中该项，开启对应的二级标签
       */
      itemClick (item) {
        this.addSelection(item);
        this.multiple === false && this.collapse();
      },
      isSelected (item) {
        var valueField = this.valueField;
        return this.selectedItems && this.selectedItems.some(function (selectionItem) {
            return selectionItem[valueField] == item[valueField];
          });
      },
      // 本地数据过滤的默认方法
      localFilter(){
        var v = this.searchKeywords, items = this.items, filterItems = [], itemLabel;
        for (var i in items) {
          itemLabel = items[i][this.labelField];
          itemLabel != null && (itemLabel.toString().indexOf(v) > -1) && filterItems.push(items[i]);
        }
        this.searchResult = filterItems;
      },
      // 下拉项选中数据的字段映射方式
      _updateModels(v){
        // 根据mapField的规则，是否需要把选中
        var map = this.map, labelField = this.labelField, valueField = this.valueField,
          labels, values, model = v, modelType;
        if (map) {
          if (v) {
            modelType = this.model;
            // model可以替代value或者label，也可与它们同时存在
            if (v instanceof Array) {
              labels = [];
              values = [];
              for (let i of v) {
                labels.push(i[labelField]);
                values.push(i[valueField]);
              }
            } else {
              labels = v[labelField];
              values = v[valueField];
            }
          }
          // 1. model替代value
          if (modelType == "value") {
            model = values;
            this._set(map, "label", labels);
          }
          // 2. model替代label
          else if (modelType == "label") {
            model = labels;
            this._set(map, "value", values);
          }
          // 3. model使用默认方式
          else {
            this._set(map, "label", labels);
            this._set(map, "value", values);
          }
        }
        return {model, label: labels, value: values}
      },
      /**设置下拉选中项。
       * 默认情况下，同时设置value和label。绑定的数据中没有和value对应的label，优先从下拉数据中查找和value对应的label，没有才使用绑定的label
       * value和label映射2个字段一前一后被赋值并且先后不定，设置primary参数可允许一个一个改变
       * @param primary
       *        "value"：只设置value字段。即使当前存在value，也可以直接改变显示的label。不会改变下拉数据中和value对应的label
       *        "label"：只设置label字段。即使当前存在value，也可以直接改变显示的label。不会改变下拉数据中和value对应的label
       * */
      _setSelectedItems(primary){
        /**设置初始选中的下拉选项
         * 如果设置了mapField字段，优先vModel
         * */
        var map = this.map;
        if (map) {
          let items, labelMap = this._parseContext(map.label), valueMap = this._parseContext(map.value),
            modelType = this.model,
            values = [], labels = [],
            _values = valueMap && valueMap.context[valueMap.field],
            _labels = labelMap && labelMap.context[labelMap.field];

          if (modelType == "value") _values = this.vModel;
          else if (modelType == "label") _labels = this.vModel;
          _values = this._convertArray(_values);
          _labels = this._convertArray(_labels);
          let arr = [];
          /**
           * */
          for (let i = 0, l = primary ? _labels.length : Math.max(_values.length, _labels.length); i < l; i++) {
            // 只设置label，value保持原来的不变
            let item = primary ? {
              [this.valueField]: _values[i],
              [this.labelField]: _labels[i]
            } : this._findItem(_values[i], _labels[i]);
            if (item) {
              arr.push(item);
              values.push(item[this.valueField]);
              labels.push(item[this.labelField]);
            }
          }
          items = arr;
          // 设置了value，label的值可能会发生改变，需要label的值同步到响应的字段
          if (!primary) {
            let labelValue = this.multiple ? labels : labels[0];
            modelType == "value" ? this._set(map, "label", labelValue) : this.$emit("on-change", labelValue, {component: this, des: "change"})
          }
          this.selectedItems = items;
        } else {
          this.selectedItems = this.vModel;
        }
      },
      _set(map, name, value) {
        let m = map[name];
        if (m) {
          let {context, field} = this._parseContext(m);
          context[field] = value;
        }
      },
      /**判断新旧数据在数据的角度上是否相等。
       * 比如在程序上，[1]不等于[1]；但在数据上视为相等。
       * 使用场景：变量发生变化执行了数据加工方法后重新使用新的变量改变原始变量，会再次触发变量修改事件
       *   进行数据上的相等判断，防止陷入死循环
       * */
      _eq(newData, oldData){
      },
      // 监听map中的变化
      _watchMap(){
        var map = this.map;
        if (map) {
          let modelType = this.model, labelMap = map.label, valueMap = map.value;
          // vModel是可响应的，
          // 监听label的变化
          if (labelMap) {
            labelMap.scope.$watch(labelMap.context, (...args) => {
              console.log(...args)
              this._setSelectedItems("label")
            });
          }
          // 监听value的变化
          if (valueMap) {
            valueMap.scope.$watch(valueMap.context, (...args) => {
              console.log(...args)
              this._setSelectedItems()
            });
          }
        }
      },
      _convert (v, k, l) {
        var valueField = this.valueField, labelField = this.labelField, obj, arr = [];
        k || (k = valueField);
        l || (l = labelField);
        //设置数据的时候要经过格式转换。兼容json、数组、对象
        //如果是字符串，先尝试当成json转成对象
        if (typeof v == "string") {
          try {
            v = JSON.parse(v);
          } catch (e) {
            v = [];
          }
        }
        if (v instanceof Array) {
          v.forEach(function (item) {
            if (typeof item == "object") {
              obj = $.extend(true, {}, item);
              obj[valueField] = item[k];
              obj[labelField] = item[l];
              valueField != k && delete obj[k];
              labelField != l && delete obj[l];
            } else {
              obj = {};
              obj[valueField] = item;
              obj[labelField] = item;
            }
            arr.push(obj);
          });
        } else if (v instanceof Object) {
          if (v.hasOwnProperty(valueField) && v.hasOwnProperty(labelField)) {
            obj = {};
            obj[valueField] = v[valueField];
            obj[labelField] = v[labelField];
            arr.push(obj);
          } else {
            for (var i in v) {
              obj = {};
              obj[valueField] = i;
              obj[labelField] = v[i];
              arr.push(obj);
            }
          }
        }
        else {
          arr = v || [];
        }
        return arr;
      },
      /**把参数统一成数组格式返回
       * @param v 数组：直接返回，空值(null,undefined,"")：返回空数组，其它：push到数组中返回
       * */
      _convertArray(v){
        return v instanceof Array ? v : this._isNull(v) ? [] : [v]
      },
      // 空值：null,undefined,""
      _isNull(v){
        return v == null || v === ""
      },
      /**补全对象表达式。"a.b.c.d" => {a:{b: {c:{d...}}}}
       * @return Object {
          context: 绑定的对象的父级对象（给绑定对象赋值必须使用父级对象）,
          field: 从context中解析出来的绑定对象的字段名称
        }
       * */
      _parseContext(map){
        if (!map) return null;
        let expr = map.context, $scope = map.scope;
        // 直接挂在根元素下的字段没有作用域表达式
        if (!expr || !$scope) throw Error("属性[value|label]-map参数不正确，context和scope都是必须的");
        let arr = expr.split("."), head, context = $scope;
        for (let i = 0, l = arr.length; i < l - 1; i++) {
          // 表达式中的上游路径的对象不存在，默认补成{}
          context = context[arr[i]] || (context[arr[i]] = {});
          // 根对象
          head || (head = context)
        }
        // 作用域路径链构建完成后，把链路的根对象挂在$scope下（构建响应式数据）
        head && ($scope[arr[0]] = head);
        return {context, field: arr[arr.length - 1]}
      },
      /**有value无label，从下拉中查找和value匹配得上的label
       * 有label无value，选中项中显示label，value空着，多选状态下的value数组也空着
       * value和label都没有，跳过空值
       * 如果没有下拉数据，等下拉数据变化后再执行上面的检测
       * */
      _findItem(value, label){
        var items = this.items, valueField = this.valueField, labelField = this.labelField;
        if (!value) {
          return null
        }
        if (!this._isNull(value)) {
          items.find(n => (n[valueField] == value) && (label = n[labelField], true));
        }
        return {[valueField]: value, [labelField]: label}
      }
    },
    created () {
      // 组件初始化，prop和v-model绑定的数据在set访问器创建之前已经注入进来。一些需要转换格式的数据需手动调用数据转换方法
      this.items = this.value;
      this._setSelectedItems();
      this._watchMap();
    },
    mounted () {
      var vue = this, $refs = this.$refs, list = $refs.list;
      list.addFocusEvent(this.$el);
      list.$on("on-expand", function (e) {
        vue.expand();
      });
      list.$on("on-collapse", function (e) {
        vue.collapse();
      });
    }
  };
</script>

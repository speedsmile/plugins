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
      <div class="icon-drop"></div>
    </div>
    <!-- 下拉区域 -->
    <focus-panel ref="list" class="drop-list">
      <slot>
        <!-- 搜素区域 -->
        <div class="search-group" v-show="filter">
          <!-- 搜索框 -->
          <div class="input-group">
            <input type="text" class="search-input" v-model="searchKeywords" :placeholder="filterPlaceholder">
            <i class="input-group-btn fa fa-search"></i>
          </div>
          <!-- 关键字搜索结果列表（焦点面板），二维数组 -->
          <!--<focus-panel ref="resultList" class="drop-list full-width">-->
          <!--<ul class="search-result list-group">-->
          <!--<li v-for="item in searchResult" :class="{selectedlight: isSelected(item)}">-->
          <!--<a class="link" href="javascript:;" @click="itemClick(item)">{{item[labelField]}}</a>-->
          <!--</li>-->
          <!--</ul>-->
          <!--</focus-panel>-->
        </div>
        <!-- 下拉列表区域 -->
        <ul class="list" v-show="!searchKeywords">
          <li v-for="item in items" :class="{selectedlight: isSelected(item)}">
            <a class="link" href="javascript:;" @click="itemClick(item)">{{item[labelField]}}</a>
          </li>
        </ul>
        <ul class="list" v-show="searchKeywords">
          <li v-for="item in searchResult" :class="{selectedlight: isSelected(item)}">
            <a class="link" href="javascript:;" @click="itemClick(item)">{{item[labelField]}}</a>
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
      t: {
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
      /**对下拉数据筛选
       * 假值：关闭搜索功能；
       * 真值（默认）：本地搜索，只对下拉中的数据新进筛选；
       * "remote"：远程搜索
       * */
      filter: {default: 1},
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
            this.items_ = this.convert(v);
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
            var selectedItems = this.convert(v);
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

              if (this.filter) {
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
          this.searchResult_ = this.convert(v);
          if (this.searchResult_ && this.searchResult_.length) {
//            this.$refs.resultList.expand();
          } else {
//            this.$refs.resultList.collapse();
          }
        }
      }
    },
    watch: {
      value: function (a, b, c) {
        this.items = this.value
      },
      vModel: function () {
        this._setSelectedItems();
      },
      map: function () {
        this._setSelectedItems();
      },
//      "$parent.editData": function(){
//        debugger;
//        this._setSelectedItems();
//      },
//      "$parent.editData.labels": function(){
//        debugger;
//        this._setSelectedItems();
//      }
    },
    methods: {
      // 添加选中项
      addSelection: function (item) {
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
        let {model} = this._mapSelectedItems(value);
        this.$emit("on-change", model, {component: this, des: "add"});
      },
      //移除选中项
      removeSelection: function (item) {
        if (this.mode == 1) {
          let selections = this.selectedItems, valueField = this.valueField;
          selections.some(function (i, index) {
            if (item[valueField] == i[valueField]) {
              selections.splice(index, 1);
              return true;
            }
          });
          let value = this.multiple ? (selections.length ? selections : null) : selections[0];
          let {model} = this._mapSelectedItems(value);
          this.$emit("on-change", model, {component: this, des: "remove"});
        }
      },
      //展开下拉，定位搜索框
      expand: function () {
        if (this.mode == 1 && this.status != "expand") {
          this.status = "expand";
          this.$refs.list.expand(1);
          this.$emit("on-open");
        }
      },
      //状态改为收回状态，下拉的收回状态由下拉对象自己处理
      collapse: function () {
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
      toggle: function () {
        if (this.mode == 1) {
          this.status == "collapse" ? this.expand() : this.collapse();
        }
      },
      /**列表项的点击选择事件
       * @param item，点击项。item.type==1，不选中该项，开启对应的二级标签
       */
      itemClick: function (item) {
        this.addSelection(item);
      },
      isSelected: function (item) {
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
      convert (v, k, l) {
        var valueField = this.valueField, labelField = this.labelField, obj, arr;
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
          return v.map(function (item) {
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
            return obj;
          });
        } else if (v instanceof Object) {
          arr = [];
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
          return arr;
        }
        return v || [];
      },
      // 补全对象表达式。"a.b.c.d" => {a:{b: {c:{d...}}}}
      _parseContext(expr, $scope){
          var arr = expr.split("."), current = $scope;
          for(let k of arr){
              // 对象表达式的路径中如果有对象不存在，默认补成{}
            current = current[k] || (current[k] = {});
          }
          return current
      },
      // 下拉项选中数据的字段映射方式
      _mapSelectedItems(v){
          debugger;
        // 根据mapField的规则，是否需要把选中
        var map = this.map, labelField = this.labelField, valueField = this.valueField,
          labels, values, model = v, modelType,
          set = (map, name, value) => {
            let m = map[name];
            debugger;
            if(m){
              let context = this._parseContext(m.context, m.scope);
              context[m.field] = value;
            }
        };
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
          if(modelType == "value"){
            model = values;
            set(map, "label", labels);
          }
          // 2. model替代label
          else if(modelType == "label"){
            model = labels;
            set(map, "value", values);
          }
          // 3. model使用默认方式
          else{
            set(map, "label", labels);
            set(map, "value", labels);
          }
        }
        return {model, label: labels, value: values}
      },
      _setSelectedItems(){
        /**设置初始选中的下拉选项
         * 如果设置了mapField字段，优先vModel
         * */
        var map = this.map;
        if(map){
          let items, labelMap = map.label, valueMap = map.value, modelType = this.model,
            labels = labelMap && this._parseContext(labelMap.context, labelMap.scope)[labelMap.field],
            values = valueMap && this._parseContext(valueMap.context, valueMap.scope)[valueMap.field];
          if(modelType == "value")values = this.vModel;
          else if(modelType == "label")labels = this.vModel;
          debugger;
          if(labels){
              if(this.multiple){
                items = [];
                for(let i = 0, l = labels.length; i < l; i++){
                  items.push({
                    [this.valueField]: values && values[i],
                    [this.labelField]: labels[i]
                  });
                }
              }else{
                  items = {
                    [this.valueField]: values,
                    [this.labelField]: labels
                  }
              }
            this.selectedItems = items;
          }
        }else{
          this.selectedItems = this.vModel;
        }
      },
      // 监听map中的变化
      _watchMap(){
          var map = this.map;
          if(map){
              let modelType = this.model, labelMap = map.label, valueMap = map.value;
            // vModel是可响应的，
              // 监听label的变化
            if(modelType == "value" && labelMap){
              labelMap.scope.$watch(labelMap.context + "." + labelMap.field, () => {
                debugger;
                this._setSelectedItems()
              });
//              labelMap.scope.$watch(labelMap.context, () => {
//                debugger;
//                this._setSelectedItems()
//              })
            }
            // 监听value的变化
            else if(modelType == "label" && valueMap){
              valueMap.scope.$watch(valueMap.context + "." + valueMap.field, () => {
                debugger;
                this._setSelectedItems()
              });
//              valueMap.scope.$watch(valueMap.context, () => {
//                debugger;
//                this._setSelectedItems()
//              })
            }
          }
      }
    },
    created () {
      // 组件初始化，prop和v-model绑定的数据在set访问器创建之前已经注入进来。一些需要转换格式的数据需手动调用数据转换方法
      this.items = this.value;
      this._setSelectedItems();
//      debugger;
      this._watchMap();
    },
    mounted () {
      var vue = this, $refs = this.$refs, list = $refs.list;
//      $refs.resultList.addActionTargets($(list.$el).find(".search-input")[0]);
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

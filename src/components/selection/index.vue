<template>
  <div class="selection"
       :class="{disabled: disabled, expand: status == 'expand', multiple: multiple, single: !multiple }">
    <!-- 显示区域，选中的下拉项 -->
    <div class="selection-area" @click="toggle">
      <!-- 选中的下拉选项 -->
      <ul class="selection-list" v-if="selectedItems && selectedItems.length">
        <li v-for="item in selectedItems" class="selection-item" :title="item[labelField]">
          <a href="javascript:void(0)">{{item[labelField]}}</a>
          <i class="icon-deselect" @click.stop="removeSelection(item)">&times;</i>
        </li>
      </ul>
      <div class="placeholder" v-else v-text="placeholder"></div>
      <i class="icon-clear" @click.stop="removeAll"
         v-if="clearable && selectedItems && selectedItems.length">
        <i class="icon">&times;</i>
      </i>
      <i class="icon-drop"></i>
    </div>
    <!-- 下拉面板 -->
    <focus-panel ref="list" class="drop-list">
      <slot name="drop">
        <!-- 搜素区域 -->
        <div class="search-group" v-if="filterable">
          <!-- 搜索框 -->
          <div class="input-group">
            <input type="text" class="search-input" v-model="searchKeywords" :placeholder="filterPlaceholder">
            <i class="input-group-btn fa fa-search"></i>
          </div>
          <!-- 关键字搜索结果列表（焦点面板），二维数组 -->
          <!--<focus-panel ref="resultList" class="drop-list full-width">-->
          <!--<ul class="search-result list-group">-->
          <!--<li v-for="item in searchResult" :class="{selected: isSelected(item)}" @click="itemClick(item)">-->
          <!--<a class="link" href="javascript:">{{item[labelField]}}</a>-->
          <!--</li>-->
          <!--</ul>-->
          <!--</focus-panel>-->
        </div>
        <!-- 下拉区域，不使用数据绑定自动生成，直接拼写html结构的方式。适用于初始化阶段，会把这个slot中的html内容自动转换成数据对象的格式，然后初始化下拉 -->
        <div class="list" v-if="!searchKeywords">
          <slot>
            <selection-option v-for="item in items" :key="toString(item)" :item="item"
                              :label-field="labelField" :value-field="valueField" :title="item[labelField]">
            </selection-option>
          </slot>
        </div>
        <!-- 搜索结果列表区域 -->
        <div class="list filter-list" v-else>
          <selection-option v-for="item in searchResult" :key="toString(item)" :item="item" :update="false"
                            :label-field="labelField" :value-field="valueField" :title="item[labelField]">
          </selection-option>
        </div>
      </slot>
    </focus-panel>
  </div>
</template>
<script>
  import "./selection.less";
  import focusPanel from "./focusPanel.vue";
  import SelectionOption from "./option.vue";
  import extend from './Extend';

  /**把虚拟的dom节点VNode解析成正常的dom结构
   * @param vnode Array 虚拟的dom节点
   *   vnode的重要结构
   {
     tag: dom标签。undefined表示当前是文本节点
     text: 文本
     data: {
       attrs: { 绑定的所有属性值 },
       on: { 绑定的所有事件 }
       slot: slot的名称
     },
     children: [ 子节点vnode ]
   }
   * */
  function parseVNode(vnode, parent) {
    let nodeList = [];
    if (vnode) {
      for (let v of vnode) {
        let node = v.tag ? document.createElement(v.tag) : document.createTextNode(v.text || "");
        nodeList.push(node);
        parseVNode(v.childNodes, node); // childNodes包含文本节点，children只包含元素节点
        parent && parent.appendChild(node)
      }
    }
    return nodeList
  }
  export default {
    name: "selection",
    components: {focusPanel, "SelectionOption": SelectionOption},
    model: {
      prop: 'vModel',
      event: 'on-model-change'
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
      placeholder: {type: String, default: ""},
      valueField: {type: String, default: "value"},
      labelField: {type: String, default: "label"},
      // 下拉数据
      value: {type: [Array, Object], default: null},
      // 选中的下拉数据——和v-model（用户数据）绑定一起
      vModel: {default: null},
      /**默认选中项。当且仅当下拉数据重置时生效，避免置空下拉选项特意把vaue设置成空
       * 对下拉数据（value）进行重置，选中的value为空，这时启用defaultIndex
       * 默认不启用。设置该字段后索引值默认是0
       * */
      defaultIndex: {default: null},
      // 是否多选
      multiple: {type: Boolean, default: false},
      /**对下拉数据筛选
       * 假值：关闭搜索功能；
       * 真值（默认）：本地搜索，只对下拉中的数据新进筛选；
       * "remote"：远程搜索
       * */
      filterable: {type: Boolean, default: true},
      // 搜索的方法，默认使用本地搜索的方法
      filterMethod: Function,
      filterPlaceholder: {type: String, default: "请输入关键字"},
      // 连续输入搜索字符停顿N毫秒后认为输入结束，然后开始执行搜索
      filterDelay: {type: Number, default: 300},
      clearable: {type: Boolean, default: false},
      // 比较下拉项对象是否相等的方法，默认 ===
      eq: {
        type: Function,
        default: (a, b) => {
          return a === b;
        }
      },
      disabled: { type: Boolean, default: false }, // 是否禁用
      model: {type: String, default: "pair"},
      // 是否显示清除
      // 下拉组件销毁时是否把对应的v-model设置成null
      clearModel: {type: Boolean, default: false}
    },
    computed: {
      // 下拉数据，对应prop——value
      items: {
        get: function () {
          return this.items_;
        },
        set: function (v) {
          let {eq, newData} = this._eq(v, this.items_);
          this.items_ = newData;
          if (!eq) {
            // 设置默认选项
            if (this.items_ && (!this.selectedItems || !this.selectedItems.length) && this.defaultIndex !== null) {
              this.selectedItems = this.items_[this.defaultIndex || 0];
            }
            else {
              // 下拉内容发生变化，可能影响到下拉选中内容，需要同步状态
              this._setSelectedItems();
            }
            // 设置下拉选项的选中状态
            this.setChildrenSelected(this.selectedItems, true)
          }
        }
      },
      // 下拉选中数据，对应v-model和prop——vModel
      selectedItems: {
        get: function () {
          return this.selectedItems_;
        },
        set: function (v) {
          let {eq, newData} = this._eq(v, this.selectedItems_);
          this.selectedItems_ = this.multiple ? newData : newData.slice(0, 1);
          if (!eq) {
            // 默认选项设置完成后同步更改绑定的数据源
            this._updateModels();
          }
          this.updateChildrenSelected(this.selectedItems_)
        }
      },
      // 输入关键字进行搜索
      searchKeywords: {
        get: function () {
          return this.searchKeywords_;
        },
        set: (function () {
          let timeoutId;
          return function (v) {
            let vue = this;

            function search(v) {
              v = v ? v.trim() : "";
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
          // 设置下拉选项的选中状态
          this.setChildrenSelected(this.selectedItems, true)
        }
      },
      clearModel_: function () {
        return this.clearModel ? "destroyed" : this.clearModel;
      }
    },
    watch: {
      value: function () {
        this.items = this.value
      },
      vModel: function () {
        this._setSelectedItems()
      }
    },
    methods: {
      /**派发change事件
       * @param name String 事件名称，"on-change"或者"on-value-change"
       * @param model Object 选中的数据
       * */
      _$emitChange(name, model){
        this.$emit(name, this.getModelValue(model), this)
      },
      getModelValue({model, labels, values}){
        let m;
        if(this.model == "value"){
          m = values;
        }else if(this.model == "label"){
          m = labels;
        }else{
          m = model;
        }
        return m;
      },
      // 添加选中项
      addSelection (item) {
        let selections = this.selectedItems, valueField = this.valueField, models;
        if (this.multiple) {
          //不能重复添加同一个选中项
          selections.every(i => !this.eq(item[valueField], i[valueField])) && (selections.push(item));
          models = this._updateModels();
          this.setChildrenSelected(this.selectedItems, true);
        } else {
          this.selectedItems = [item];
          models = {model: item, labels: item[this.labelField], values: item[valueField]};
        }
        this._$emitChange("on-change", models);
      },
      //移除选中项
      removeSelection (item) {
        let selections = this.selectedItems, valueField = this.valueField;
        selections.some((i, index) => {
          if (this.eq(item[valueField], i[valueField])) {
            selections.splice(index, 1);
            return true;
          }
        });
        this.setChildrenSelected([item], false);
        let models = this._updateModels();
        this._$emitChange("on-change", models);
      },
      // 移除全部选项
      removeAll(){
        this.selectedItems = null;
        this.$refs.list.$children.forEach(child => {
          child.selected = false
        });
        this.$emit("on-change", null, this);
      },
      /**设置指定的下拉项的选中状态
       * @param items Object 待设置的节点的数据
       * @param selected Boolean 选中/取消
       * */
      setChildrenSelected(items, selected){
        function set(item, child) {
          // 把数据匹配的下拉项设置成选中状态，把不匹配的设置成未选中
          if (child.match(item)) {
            child.setProps({selected})
          }
        }
        this.$nextTick(() => {
          let children = this.$refs.list && this.$refs.list.$children;
          items.length && items.forEach(item => {
            children.length && children.forEach(child => set(item, child));
          });
        })
      },
      /**更新所有下拉选项的选中状态
       * */
      updateChildrenSelected(items){
        items = this._convertArray(items);
        this.$nextTick(() => {
          let children = this.$refs.list && this.$refs.list.$children;
          children.forEach(child => {
            child.setProps({selected: items.some(item => child.match(item))});
          });
        })
      },
      // Todo 展开下拉，选中项的对应数据要显示在看得见的地方
      expand () {
        if (!this.disabled && this.status != "expand") {
          this.status = "expand";
          this.$refs.list.expand(1);
          this.$emit("on-open");
        }
      },
      //状态改为收回状态，下拉的收回状态由下拉对象自己处理
      collapse () {
        if (!this.disabled) {
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
        if (!this.disabled) {
          this.status == "collapse" ? this.expand() : this.collapse();
        }
      },
      /**列表项的点击选择事件
       * @param item，点击项。
       */
      itemClick (item) {
        this.addSelection(item);
        // 多选状态下，选中一个下拉项不会自动关闭下拉
        this.multiple || this.collapse();
      },
      isSelected (item) {
        let valueField = this.valueField;
        return this.selectedItems && this.selectedItems.some(selection => this.eq(selection[valueField], item[valueField]));
      },
      // 本地数据过滤的默认方法
      localFilter(){
        let v = this.searchKeywords, items = this.items, filterItems = [], itemLabel;
        for (let i in items) {
          itemLabel = items[i][this.labelField];
          itemLabel != null && (itemLabel.toString().indexOf(v) > -1) && filterItems.push(items[i]);
        }
        this.searchResult = filterItems;
      },
      /**下拉项选中数据改变后，同步更改外部绑定的字段。
       * 使用：selectedItems
       * */
      _updateModels(){
        // 根据mapField的规则，是否需要把选中
        let selections = this.selectedItems, model, values, labels,
          labelField = this.labelField, valueField = this.valueField,
          v = selections && (this.multiple ? (selections.length ? selections : null) : selections[0]);
        if (v) {
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
        model = this.getModelValue({model: v, labels, values});
        this.$emit("on-model-change", model, this);
        this._$emitChange("on-value-change", {model, labels, values});
        return {model, labels, values};
      },
      /**外部数据发生变化，同步设置下拉选中项。
       * 引起变化的数据分别是：v-model，values，labels，value(下拉数据)
       * 设置：selectedItems
       * 默认情况下，同时设置value和label。绑定的数据中没有和value对应的label，优先从下拉数据中查找和value对应的label，没有才使用绑定的label
       * value和label映射2个字段一前一后被赋值并且先后不定，设置primary参数可允许一个一个改变
       * defaultIndex：如果下拉的value为空，启用默认选中项，索引从0开始
       * */
      _setSelectedItems(){
        /**设置初始选中的下拉选项
         * 如果设置了mapField字段，优先vModel
         * */
        if (this.status == "beforeDestroy" || this.status == "destroyed")return;
        let items = [], values = [], labels = [], vModel = this.vModel;
        vModel = this._convertArray(vModel);
        for (let m of vModel) {
          let value, label;
          if(this.model == "value"){
            value = m;
          }else if(this.model == "label"){
            label = m;
          }else{
            value = m[this.valueField];
            label = m[this.labelField];
          }
          let item = this._findItem(value, label);
          if (item) {
            items.push(item);
            values.push(item[this.valueField]);
            labels.push(item[this.labelField]);
          }
        }
        // 设置了value，label的值可能会发生改变，需要label的值同步到响应的字段
        this.selectedItems = items;
      },
      // 把绑定的label和value都设置成null
      _clearModel(){
        this.$emit("on-model-change", null, this);
      },
      /**判断新旧数据在数据层面上是否相等。新旧数据的结构都是{labelField, valueField}
       * 比如在程序上，[1]不等于[1]；但在数据上视为相等。
       * 使用场景：变量发生变化执行了数据加工方法后重新使用新的变量改变原始变量，会再次触发变量修改事件
       *   进行数据上的相等判断，防止陷入死循环
       *
       * */
      _eq(newData, oldData){
        let eq = true;
        newData = this._convert(newData);
        oldData = this._convert(oldData);
        if (newData.length != oldData.length) eq = false;
        else {
          for (let i in newData) {
            if (!this.eq(newData[i][this.valueField], oldData[i][this.valueField])) {
              eq = false;
              break;
            }
          }
        }
        return {eq, newData, oldData};
      },
      /**统一转换下拉数据的格式，兼容json字符串、数组、对象。最终以数组嵌套对象的形式返回：[ {valueField: , labelField}... ]
       * @param v String|Object|Array 待转换的数据
       * @param k String valueField
       * @param l String labelField
       * @return Array({valueField: , labelField}...)
       * */
      _convert (v, k, l) {
        let valueField = this.valueField, labelField = this.labelField, obj, arr = [];
        k || (k = valueField);
        l || (l = labelField);
        //如果是字符串，先尝试当成json转成对象
        if (typeof v == "string") {
          try {
            v = JSON.parse(v);
          } catch (e) {
            v = [];
          }
        }
        if (v instanceof Array) {
          v.forEach((item) => {
            obj = {};
            let modelValue;
            if (typeof item == "object") {
              obj = extend(true, {}, item);
              obj[valueField] = item[k];
              obj[labelField] = item[l];
              valueField != k && delete obj[k];
              labelField != l && delete obj[l];
            } else {
              if(this.model == "label"){
                obj[labelField] = item;
                modelValue = this._findItem(null, item);
              }else if (this.model == "value"){
                modelValue = this._findItem(item, null);
              }
              obj = modelValue;
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
            for (let i in v) {
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
      /**把非数组类型的参数简单包装成数组返回，格式统一，便于操作
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
      _parseContext(expr){
        let $context = this.context;
        // 直接挂在根元素下的字段没有作用域表达式
        if (!expr)return;
        if (!$context) throw Error("属性context是必须的");
        let arr = expr.split("."), head, context = $context;
        for (let i = 0, l = arr.length; i < l - 1; i++) {
          // 表达式中的上游路径的对象不存在，默认补成{}
          context = context[arr[i]] || (context[arr[i]] = {});
          // 根对象
          head || (head = context)
        }
        // 作用域路径链构建完成后，把链路的根对象挂在$context下（构建响应式数据）
        head && ($context[arr[0]] = head);
        return {context, field: arr[arr.length - 1]}
      },
      /**给定value或者label来补全完整的{value, label}
       * 如果没有下拉数据，等下拉数据变化后再执行上面的检测
       * */
      _findItem(value, label){
        let items = this.items, valueField = this.valueField, labelField = this.labelField,
          hasValue = !this._isNull(value), hasLabel = !this._isNull(label);
        if (!hasValue && !hasLabel) { // 跳过空值
          return null;
        } else if (hasValue) { // 有value，尝试着从下拉中查找和value匹配得上的label，没有则使用指定的label
          items.some(n => (this.eq(n[valueField], value)) && (label = n[labelField], true));
        }
        // 剩下只有label的情况。选中项中显示label，value空着，多选状态下的value数组也空着
        return {[valueField]: value, [labelField]: label}
      },
      toString(item){
        return JSON.stringify(item)
      }
    },
    created () {
      let optionUpdateId;
      // 自定义下拉选项的数据发生改变，通知Selection组件进行数据更新。为了避免更新频繁，设置了定时器。
      this.$on("on-selection-option-update", (data, option) => {
        // 给外部监听的事件
        this.$emit("on-option-update", data, option, this);
        clearTimeout(optionUpdateId);
        optionUpdateId = setTimeout(() => {
          this.$nextTick(() => {
            this.items = this.$slots.default ? this.$refs.list.$children.map(child => child.state.item) : this.value;
            // 所有组件更新完成
            this.$emit("on-options-updated", this);
          });
        }, 200);
      });
    },
    mounted () {
      let $refs = this.$refs, list = $refs.list;
      list.addFocusEvent(this.$el);
      list.$on("on-expand", () => this.expand());
      list.$on("on-collapse", () => this.collapse());
      this.$on("on-item-click", (...args) => this.itemClick(...args));
      // 组件初始化，prop和v-model绑定的数据在set访问器创建之前已经注入进来，无法执行set访问器中的
      /**下拉的初始化数据可能来源于value值的绑定，也可能是slot传入
       * @return 如果使用slot传入下拉项，在mounted方法中从selection-option节点中提取出数据对象；反之使用原本的value值
       * */
      this.$slots.default || (this.items = this.value);
      // 初始化下拉的各种变量的数据结构
       this._setSelectedItems();
    },
    beforeDestroy(){
      this.status = "beforeDestroy";
      this.$emit("on-before-destroy", this);
    },
    /**销毁下拉组件，重新生成一个新的
     * */
    destroyed(){
      this.status = "destroyed";
      if (this.clearModel_ == "destroyed") {
        this._clearModel();
      }
      this.$emit("on-destroyed", this);
    }
  };
</script>

<template>
  <div class="list-item" :class="{selected: state.selected}" :title="state.label" @click="itemClick">
    <slot>{{state.label}}</slot>
  </div>
</template>
<script>
  import Emitter from './emitter';
  /**向上寻找符合组件名称的组件
   * */
  function closest(name){
    let parent = this.$parent || this.$root;
    while (parent && parent.$options.name != name) {
      parent = parent.$parent;
    }
    return parent;
  }
  export default {
    name: "selection-option",
    props: {
      // item拆解成value和label，优先级：value -> label -> item
      value: {},
      label: {type: String},
      item: {default: null}, // 对应itemData
      update: { // option组件创建通知父组件更新状态
        type: Boolean,
        default: true
      }
    },
    mixins: [ Emitter ],
    data: () => ({
      state: {
        value: null,
        label: "",
        item: null,
        selection: null, // 父组件的引用
        selected: false
      }
    }),
    computed: {
      valueField: function(){return this.state.selection.valueField},
      labelField: function(){return this.state.selection.labelField}
    },
    methods: {
      itemClick(){
        this.dispatch('selection', 'on-item-click', [this.state.item, this]);
      },
      /**根据数据来匹配对应的下拉项
       * @item Object 匹配的数据
       * @return Boolean 匹配成功返回true
       * */
      match(item){
        return this.state.selection.valueEqual(item[this.valueField], this.state.value)
      },
      /**设置属性
       * @props Object 匹配成功设置属性值
       * */
      setProps(props){
        Object.assign(this.state, props)
      }
    },
    created(){
      this.state.selection = closest.call(this, "selection");
      let propsData = this.$options.propsData, item = propsData.hasOwnProperty("item") ? propsData.item : {},
        {valueField, labelField} = this;
      this.state.value = propsData.hasOwnProperty("value") ? this.value : item[valueField];
      this.state.label = propsData.hasOwnProperty("label") ? this.label : item[labelField] || (this.$slots.default && this.$slots.default[0] && this.$slots.default[0].text);
      this.state.item = {[valueField]: this.state.value, [labelField]: this.state.label};
      // 下拉选项发生改变，通知父组件更新数据
      this.update && this.dispatch('selection', 'on-selection-option-update', [this.state.item, this]);
    }
  }
</script>

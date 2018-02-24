<template>
  <div class="list-item" :class="{selected: this.selected}" :title="text" @click="itemClick">
    <slot>{{text}}</slot>
  </div>
</template>
<script>
  // TODO 增加配置参数，value项是要强等于还是弱等于。目前是强等于
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
      value: {}, // 对应v
      label: {type: String}, // 对应text
      item: {default: null}, // 对应itemData
      update: { // option组件创建通知父组件更新状态
        type: Boolean,
        default: true
      }
    },
    mixins: [ Emitter ],
    data(){
      return {
        selection: null,
        v: null,
        text: "",
        itemData: null,
        selected: false
      }
    },
    methods: {
      itemClick(){
        this.dispatch('selection', 'on-item-click', [this.itemData, this]);
      },
      /**根据数据来匹配对应的下拉项
       * @item Object 匹配的数据
       * @return Boolean 匹配成功返回true
       * */
      match(item){
        return item[this.selection.valueField] === this.v
      },
      /**设置属性
       * @props Object 匹配成功设置属性值
       * */
      setProps(props){
        Object.assign(this, props)
      }
    },
    created(){
      let propsData = this.$options.propsData, item = propsData.hasOwnProperty("item") ? propsData.item : {};
      this.selection = closest.call(this, "selection");
      this.v = propsData.hasOwnProperty("value") ? this.value : item[this.selection.valueField];
      this.text = propsData.hasOwnProperty("label") ? this.label : item[this.selection.labelField] || (this.$slots.default && this.$slots.default[0] && this.$slots.default[0].text);
      this.itemData = {[this.selection.valueField]: this.v, [this.selection.labelField]: this.text};
      // 下拉选项发生改变，通知父组件更新数据
      this.update && this.dispatch('selection', 'on-selection-option-update', [this.itemData, this]);
    }
  }
</script>

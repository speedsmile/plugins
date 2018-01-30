<template>
  <div class="list-item" :class="{selected: this.selected}" :title="text" @click="itemClick">
    <slot>{{text}}</slot>
  </div>
</template>
<script>
  // TODO 增加配置参数，value项是要强等于还是弱等于。目前是强等于
  import Emitter from './emitter';
  export default {
    name: "selection-option",
    props: {
      // item拆解成value和label，优先级：value -> label -> item
      value: {}, // 对应v
      label: {type: String}, // 对应text
      item: {default: null}, // 对应itemData
      valueField: {type: String, default: "value"},
      labelField: {type: String, default: "label"}
    },
    mixins: [ Emitter ],
    data(){
      return {
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
        return item[this.valueField] === this.v
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
      this.v = propsData.hasOwnProperty("value") ? this.value : item[this.valueField];
      this.text = propsData.hasOwnProperty("label") ? this.label : item[this.labelField] || (this.$slots.default && this.$slots.default[0] && this.$slots.default[0].text);
      this.itemData = {[this.valueField]: this.v, [this.labelField]: this.text};
    }
  }
</script>

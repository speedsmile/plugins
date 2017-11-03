/**
 * Created by weikaiwei on 2017/11/2.
 * 配合iview的Form组件的校验框架，需要引入该js
 */
import "./selection.less";
// import Emitter from 'iview/src/mixins/emitter';
function broadcast(componentName, eventName, params) {
  this.$children.forEach(child => {
    const name = child.$options.name;

    if (name === componentName) {
      child.$emit.apply(child, [eventName].concat(params));
    } else {
      // todo 如果 params 是空数组，接收到的会是 undefined
      broadcast.apply(child, [componentName, eventName].concat([params]));
    }
  });
}
const Emitter = {
  methods: {
    dispatch(componentName, eventName, params) {
      let parent = this.$parent || this.$root;
      let name = parent.$options.name;

      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;

        if (parent) {
          name = parent.$options.name;
        }
      }
      if (parent) {
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    },
    broadcast(componentName, eventName, params) {
      broadcast.call(this, componentName, eventName, params);
    }
  }
};

const obj = Object.assign({
  mounted(){
    this.$on("on-change", function(){
      /** 触发iview 校验 **/
      this.dispatch('FormItem', 'on-form-change', ...arguments);
    })
  }
}, Emitter);
export default obj;

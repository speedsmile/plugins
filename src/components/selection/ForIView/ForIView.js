/**
 * Created by weikaiwei on 2017/11/2.
 * 配合iview的Form组件的校验框架，需要引入该js
 */
import "./selection.less";
import Emitter from '../emitter';
const obj = Object.assign({
  mounted(){
    this.$on("on-change", function(){
      /** 触发iview 校验 **/
      this.dispatch('FormItem', 'on-form-change', ...arguments);
    })
  }
}, Emitter);
export default obj;

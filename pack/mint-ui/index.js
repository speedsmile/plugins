// import "mint-ui/lib/datetime-picker/style.css";
// import "mint-ui/lib/picker/style.css";
// import "mint-ui/lib/popup/style.css";
import {DatetimePicker} from "mint-ui";
self.define(function(require, exports, module){
  exports.install = function(Vue){
    Vue.component(DatetimePicker.name, DatetimePicker);
  };
});

import $ from "jquery";
import Vue from "vue";
import "iview/dist/styles/iview.css";
import Iview from "iview";
import selection from "@modules/component/selection";
window.$ = window.jQuery = $;
Vue.use(Iview);
Vue.component(selection.name, selection);
window.vm = new Vue({
  el: "#app",
  data: {
    labels: null,
    editData: {
      selection: 2,
      labels: null,
      values: null
    },
    ruleValidate: {
      select: [
        {required: true, message: 'select', trigger: 'change'}
      ],
      selection: [
        {
          trigger: 'change',
          message: "不能为空",
          validator: function(rule, value, callback){
            console.log("change = " + value)
            if(value)callback();
            else callback(rule.message)
          }
        }
      ]
    },
    items: [{"value":"1","label":"北京"},{"value":"2","label":"上海"},{"value":"3","label":"广州"},{"value":"4","label":"深圳"},{"value":"5","label":"天津"},{"value":"6","label":"重庆"}],
    selectedItems: [{"value":"1","label":"北京"},{"value":"2","label":"上海"},{"value":"3","label":"广州"}]
  },
  methods: {
    filter(v, cb){
      cb([{key: "a", text: "aaa"}])
    },
    formChange: function(){
    },
    log(){
      console.log.apply(console, arguments)
    }
  },
  mounted(){
    // this.editData = {
    //   selection: [3,4],
    //     labels: ["广州", "深圳"],
    //     values: null
    // }
    // this.editData.labels = ["广州", "深圳"];
    // this.editData.selection = [3, 4];
    // this.editData.selection = 3;
    // this.editData.labels = "广州";
  }
});

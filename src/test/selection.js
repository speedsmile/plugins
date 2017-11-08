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
    labels: ["2"],
    editData: {
      selection: null,
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
            if(value)callback();
            else callback(rule.message)
          }
        }
      ]
    },
    items: [
      {"key": "1", "text": "北京"}, {"key": "2", "text": "上海"}, {"key": "3", "text": "广州"}, {
        "key": "4",
        "text": "深圳"
      }, {"key": "5", "text": "天津"}, {"key": "6", "text": "重庆"}
      ],
    selectedItems: [
      {"key": "1", "text": "北京"}, {"key": "2", "text": "上海"}, {"key": "3", "text": "广州"}
    ]
  },
  methods: {
    filter(v, cb){
      cb([{key: "a", text: "aaa"}])
    },
    formChange: function(){
    },
    log(){
      // console.log.apply(console, arguments)
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

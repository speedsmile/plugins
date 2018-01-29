<template>
    <div>
      <button @click="i=!i" style="width: 100px;height:32px;"></button>
      <i-form ref="editData" :model="editData" :rules="ruleValidate">
        <form-item label="selection" prop="selection" v-if="i">
          <selection v-model="editData.selection" :value="items"  placeholder="请xcvxc选择"
                     :filter-method="filter" clearable clear-model
                     label-model="labels" :context="this" multiple
                     @on-change="log('change')" @on-destroyed="log(this)"
          >

            <!--<selection-option :value="i" v-for="i in 5" :a="i">-->
            <!--test  kl-->
            <!--<span :a="i" :class="{a: i==2}">0.5KM</span>-->
            <!--</selection-option>-->
            <!-- 注释 -->
            <!--<div value="500">0.5KM</div>-->
            <!--<div value="1000">1KM</div>-->
            <!--<div value="2000">2KM</div>-->
            <!--<div value="3000">3KM</div>-->
            <!--<div value="4000">4KM</div>-->
            <!--<div value="5000">5KM</div>-->
          </selection>
        </form-item>
        <form-item label="select" prop="select">
          <div class="groups cat-pre">
            <i-select v-model="editData.select" clearable>
              <i-option v-for="i in items" :key="i.value" :value="i.value">{{i.label}}</i-option>
            </i-select>
          </div>
        </form-item>
      </i-form>
    </div>
</template>
<script>
import Vue from "vue";
import "iview/dist/styles/iview.css";
import Iview from "iview";
import selection from "@/components/selection";
import option from "@/components/selection/option";
Vue.use(Iview);
Vue.component(selection.name, selection);
Vue.component(option.name, option);
export default {
  data(){
    return {
      i:1,
      labels: null,
      editData: {
        selection: "2",
        labels: null,
        values: null,
        select: []
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
    }
  },
  methods: {
    filter(v, cb){
      cb([{key: "a", text: "aaa"}])
    },
    formChange: function(){
    },
    log(){
      console.log.apply(console, arguments)
    },
    des(){
      debugger;
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
}
</script>
<style lang="">

</style>

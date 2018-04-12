<template>
  <div>
    <button @click="click" style="width: 100px;height:32px;"></button>
    <i-form ref="editData" :model="editData" :rules="ruleValidate">
      <form-item label="selection">
        <selection ref="selection" multiple v-model="editData.values" model="value" :value="items" placeholder="请选择"
                   :filter-method="function (v, cb) {cb({1: 'aaa', 2: 'bbb', 3: 'ccc'})}" @on-change="onChange"
                   clearable clear-model default-index="2"
        >
        </selection>
      </form-item>
      <form-item label="复杂value">
        <selection placeholder="请选择" v-model="complexModel"
                   :filter-method="filter" clearable clear-model
                   multiple
                   :eq="function(a,b){return a[0] === b[0]}"
                   @on-change="log('change')" @on-destroyed="log(this)"
        >
          <selection-option v-for="item,i in complex" :value="item" :key="i" :label="item[1]"></selection-option>
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
        i: 1,
        labels: null,
        editData: {
          selection: "2",
          labels: null,
          values: ["4", "2"],
          select: null,
        },
        ruleValidate: {
          select: [
            {required: true, message: 'select', trigger: 'change'}
          ],
          selection: [
            {
              trigger: 'change',
              message: "不能为空",
              validator: function (rule, value, callback) {
                console.log("change = " + value)
                if (value) callback();
                else callback(rule.message)
              }
            }
          ]
        },
        complex: [
          [
            "bms_waybill_fee.create_time",
            "创建时间",
            "date"
          ],
          [
            "tms_waybill.create_time",
            "运单时间",
            "date"
          ],
          [
            "bms_waybill_fee.modify_time",
            "修改时间",
            "date"
          ],
          [
            ".modify_time.waybill_pod_date",
            "运单签收日期",
            "date"
          ],
          [
            "md_dc.name",
            "操作DC",
            "text"
          ],
          [
            "dataDic.codename1",
            "单据渠道",
            "text"
          ],
          [
            "bms_waybill_fee.g_account_no",
            "客户账号",
            "text"
          ],
          [
            "bms_customer.company",
            "客户名称",
            "text"
          ],
          [
            "bms_waybill_fee.belongsBodyName",
            "公司主体",
            "text"
          ],
          [
            "dataDic.codename",
            "件型",
            "text"
          ],
          [
            "DA2.delivery_area_name AS '派送配送区域', LEFT JOIN md_delivery_area AS DA2 ON W(bms_waybill_fee).send_delivery_area_code = DA2.id",
            "派送配送区域",
            "text"
          ]
        ],
        complexModel: [{value: ['tms_waybill.create_time']}],
        obj: {aaa: "aaa", bbb: "bbb", ccc: "ccc"},
        items: [{"value": "1", "label": "北京"}, {"value": "2", "label": "上海"}, {
          "value": "3",
          "label": "广州"
        }, {"value": "4", "label": "深圳"}, {"value": "5", "label": "天津"}, {"value": "6", "label": "重庆"}, {
          "value": "7",
          "label": "福建"
        }, {"value": "8", "label": "厦门"}, {"value": "9", "label": "广西"}, {"value": "10", "label": "青岛"}, {
          "value": "11",
          "label": "香港"
        }, {"value": "12", "label": "澳门"}],
        selectedItems: [{"value": "1", "label": "北京"}, {"value": "2", "label": "上海"}, {"value": "3", "label": "广州"}]
      }
    },
    methods: {
      filter(v, cb){
        cb([{key: "a", text: "aaa"}])
      },
      formChange: function () {
      },
      log(){
        console.log.apply(console, arguments)
      },
      des(){
        debugger;
      },
      click(){
        this.items = this.selectedItems;
      },
      onChange(a, b, c){
        debugger
      }
    },
    mounted(){
      window.vm = this;
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

<template>
  <div>
    <div>
      <input type="text" name="name" data-rule="require">
      <div class="hide error-tip" name="name-error" error-tip="111" error-tip-require="2222">不能为空</div>
    </div>
    <div>
      <input type="text" name="pwd" data-rule="require;v">
      <div class="hide error-tip" name="pwd-error" error-tip="111" error-tip-require="密码">密码不能为空</div>
    </div>
    <button @click="v" style="width: 75px;height:30px;"></button>
  </div>
</template>
<script>
  let $ = require("jquery");
  window.$ = $;
  import Vue from "vue";
  import VForm from "@/plugin/VForm";
  var vForm;
  export default {
    data(){
      return {
      }
    },
    methods: {
      v(){
        vForm.validate().then(function(a, b, c){
          debugger
        }).catch(function(a, b, c){
          debugger
        })
      }
    },
    mounted(){
      window.vm = this;
      vForm = window.vFrom = new VForm({
        fields: [
          {name: "name"},
          {
            name: "pwd",
            rule: [
              {}
            ]
          },
        ],
      });
    }
  }
</script>
<style>
  .hide{
    display: none;
  }
</style>

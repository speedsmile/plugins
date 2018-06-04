<template>
    <tree-menu ref="menu" key-field="menuId" children="list" :data="menuList" accordion>
    </tree-menu>
</template>
<script>
import Vue from "vue";
import "@/components/tree-menu/style/tree.less";
import TreeMenu from "@/components/tree-menu";
export default {
  components: {TreeMenu},
  data(){
    return {
      menuList: null
    }
  },
  methods: {
  },
  mounted(){
    window.vm = this;
    this.menuList = [
      {menuId: "1", name: "系统管理", url: "empty.html", icon: "iconfont icon-yonghuguanli"},
      {menuId: "1_1", parentId: "1", name: "用户管理", selected:true, url: "empty.html", icon: "iconfont icon-yonghuguanli"},
      {menuId: "1_2", parentId: "1", name: "权限管理", url: "empty.html", icon: "iconfont icon-yonghuguanli"},
//      {menuId: "1_1_1", parentId: "1_1", name: "使用记录", url: "empty.html", icon: "iconfont icon-yonghuguanli"},
      {menuId: "2", name: "个人中心", icon: "iconfont icon-yonghuguanli"},
      {menuId: "2_1", parentId: "2", name: "个人资料", url: "empty.html", selected: false, icon: "iconfont icon-yonghuguanli"},
      {menuId: "2_2", parentId: "2", name: "我的订单", url: "empty.html", icon: "iconfont icon-yonghuguanli"}
    ]
  }
}
</script>
<style lang="">

</style>

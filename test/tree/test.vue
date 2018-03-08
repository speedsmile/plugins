<template>
    <tree-menu ref="menu" key-field="menuId" children="list" :value="menuList" accordion>
    </tree-menu>
</template>
<script>
import Vue from "vue";
import "@/components/treeMenu/style.less";
import TreeMenu from "@/components/treeMenu";
// 格式化菜单列表数据。支持扁平化和嵌套混合模式的数据
function routerList(menuList) {
  var keyField = "menuId", parentField = "parentId", subField = "list", urlField = "url";

  function serialize(menuList) {
    var rootList = [], map = {}, temp = {}, key, node, parentKey, parentNode, subNodes;
    for (var i in menuList) {
      node = menuList[i];
      key = node[keyField];
      parentKey = node[parentField];
      /**数据有[parentField]，把数据挂到[parentField]对应数据的[subField]中。
       * 如果对应的[parentField]数据还没有生成，把当前数据挂到临时区域内。等待父节点初始化的时候合并。
       * 没有parentKey的数据是一级节点
       * */
      if (parentKey) {
        // 映射区中查找父节点
        if (parentNode = map[parentKey]) {
          /**父节点的[sub]已存在当前节点
           * true：在该节点本来的位置上替换掉该节点
           * false：添加该节点
           * */
          subNodes = parentNode[subField];
          if (!subNodes.some(function (item, i) {
              if (item[keyField] == key) {
                subNodes[i] = node;
                return true;
              }
            })
          ) {
            subNodes.push(node);
          }
        } else {
          temp[parentKey] = node;
        }
      } else {
        rootList.push(node);
      }

      /**1、把数据挂到映射区域
       * 2、如果当前数据本身具有[sub]（嵌套子级结构），使用相同的逻辑注册这些子节点
       * 3、在临时区域查找同名[key]数据，把该数据（数组格式）合并到当前数据的[sub]中
       * */
      // 1
      map[key] = node;
      // 2
      if (Object.prototype.toString.call(node[subField]) == "[object Object]") {
        node[subField] = [node[subField]];
      } else if (Object.prototype.toString.call(node[subField]) != "[object Array]") {
        node[subField] = []
      }
      serialize(node[subField]);
      // 3
      if (temp[key]) {
        node[subField].concat(temp[key]);
        delete temp[key];
      }
    }
    return rootList;
  }

  return serialize(menuList);
}
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
    this.menuList = routerList([
      {menuId: "1", name: "系统管理", url: "empty.html", icon: "iconfont icon-yonghuguanli"},
      {menuId: "1_1", parentId: "1", name: "用户管理", selected:true, url: "empty.html", icon: "iconfont icon-yonghuguanli"},
      {menuId: "1_2", parentId: "1", name: "权限管理", url: "empty.html", icon: "iconfont icon-yonghuguanli"},
//      {menuId: "1_1_1", parentId: "1_1", name: "使用记录", url: "empty.html", icon: "iconfont icon-yonghuguanli"},
      {menuId: "2", name: "个人中心", icon: "iconfont icon-yonghuguanli"},
      {menuId: "2_1", parentId: "2", name: "个人资料", url: "empty.html", selected: false, icon: "iconfont icon-yonghuguanli"},
      {menuId: "2_2", parentId: "2", name: "我的订单", url: "empty.html", icon: "iconfont icon-yonghuguanli"}
    ])
  }
}
</script>
<style lang="">

</style>

<template>
  <!-- 多个根节点NodeList -->
  <ul class="node-list">
    <li v-for="item in dataList" class="tree-node"
        :class="{'leaf-node': isLeaf(item), 'select-node': isSelected(item), 'open-node': getState(item, 'isOpen'), 'close-node': getState(item, 'isClose')}"
    >
      <div class="tree-item" @click="clickNode($event, item)">
        <div class="tree-content">
          <i v-if="item[icon] != null" :class="item[icon]"></i>
          <span class="node-text">{{item[text]}}</span>
        </div>
        <!-- 非叶节的箭头，表示节点展开或者关闭。菜单模式的箭头在右边 -->
        <i v-if="!isLeaf(item)" class="arrow" @click="clickNode($event, item, 'icon')"/>
      </div>
      <!-- 子节点 -->
      <node v-if="!isLeaf(item)" class="tree-sub" v-show="isOpen(item)"
            :type="type"
            :data="item[children]"
            :root="_root_" :parent="item"
            :multiple="multiple" :accordion="accordion"
            :select="select" :key-field="keyField" :text="text" :children="children" :icon="icon"
      />
    </li>
  </ul>
</template>
<script>
  // TODO 树节点展开/收回时的动画缓动效果
  export default {
    name: 'node',
    props: {
      // 类型：menu：菜单样式的树，默认普通的树
      type: String,
      data: {default: null}, // 原始节点设置的入口数据
      /**整棵树的全局信息
       * */
      root: {default: null},
      parent: {default: null},
      keyField: {default: "id"},
      text: {default: "name"},
      children: {default: "children"},
      select: {default: "selected"}, // 默认选中的节点属性名称
      icon: {default: "icon"},
      open: {default: "open"}, // 默认展开的节点属性名称
      multiple: {default: false, type: Boolean}, // 是否开启多选
      accordion: {default: false, type: Boolean}, // 手风琴模式。同级树节点一次只能展开一个
    },
    data() {
      return {
        /* 整棵树的全局信息，需要构建维护，对应props.root
          {
             data: [], // 数组格式全部节点
             map: {}, // 对象格式全部节点
             state: {}, // 对象格式全部节点的状态
             selectedNodes: [],
           }
        */
        _root_: null, // 对应root
        /* 状态数据，记录一个树节点的状态变化，不关联到原始的数据上
           {
              key: { // 节点的唯一标识
                index: null, //数据的唯一标志，如果没有指定id，这个值将起作用。父index_子index
                isOpen: 1, //展开
                isClose: 0, //收回
                isSelected: 0, //是否选中
                isLeaf: 0, // 是否叶节点
              }
            }
        */
        substates: {}
      }
    },
    computed: {
      /**一个tree-menu组件渲染一个nodeList集合
       * */
      dataList: {
        get: function () {
          let data = this.data, parent = this.parent, type;
          !data && parent && (data = parent[this.children]);
          type = Object.prototype.toString.call(data);
          if (type === "[object Object]") {
            return [data];
          } else if (type === "[object Array]") {
            return data
          }
          return [];
        }
      },
      isMenu() {
        return this.type == "menu"
      }
    },
    methods: {
      isRoot: function () {
        return !this.parent;
      },
      isLeaf: function (node) {
        return !(node[this.children] && node[this.children].length);
      },
      isOpen: function (node) {
        return this.getState(node, "isOpen");
      },
      isSelected: function (node) {
        return this.getState(node, "isSelected");
      },
      /**返回指定节点中特定状态的值
       * @param node Object 树节点
       * @param stateName String 节点状态名称，不指定返回整个state对象
       * @return 返回指定节点的指定状态的值
       * */
      getState: function (node, stateName) {
        let states = this._root_.state;
        return arguments.length < 2 ? states[node[this.keyField]] : states[node[this.keyField]] && states[node[this.keyField]][stateName];
      },
      /**设置指定节点中特定状态的值
       * @param node Object 树节点
       * @param stateName String 节点状态名称
       * @param value Object 节点状态值
       * */
      setState: function (node, stateName, value) {
        let states = this._root_.state;
        states[node[this.keyField]][stateName] = value
      },
      /**展开/关闭节点。
       * @node Object 节点数据对象
       * @flag Boolean true，展开节点；false，关闭节点。不指定该参数则设置与node相反的状态
       * */
      toggle: function (node, flag) {
        let state = this.getState(node);
        if (!state.isLeaf) {
          arguments.length < 2 && (flag = !this.isOpen(node));
          state.isOpen = flag;
          state.isClose = !flag;
          // 手风琴模式，同级节点一次只能展开一个，如果自身展开了，就得关闭同级的其它节点
          if (flag && this.accordion) {
            this.everyNode((otherNode, state) => {
              // 兄弟节点的parentId相同
              if (node[this.keyField] != otherNode[this.keyField] && node.parentId == otherNode.parentId)
                (state.isOpen = 0, state.isClose = 1);
            });
          }
          // 向外层派发事件
          this.emit(flag ? "open" : "close", node, state);
        }
      },
      /**选中/取消节点的选中状态
       * */
      toggleSelect: function (node, flag) {
        let state = this.getState(node), nodeKey = state.key;
        arguments.length < 2 && (flag = !state.isSelected);
        state.isSelected = flag;
        /**multiple==false模式下，选中状态具有互斥性
         * 从根节点开始层层遍历，取消当前节点之外的节点选中状态
         * */
        if (!this.multiple) {
          this.everyNode((node, state) => {
            state.key == nodeKey || (state.isSelected = 0);
          });
        }
        this.emit("select", node, state);
      },
      /**遍历所有节点的方法，通过回调来处理每个节点。
       * @node Object|Array 被递归遍历的节点
       * @callback Function 每次迭代处理节点的方法。返回true，停止遍历
       * */
      everyNode: function (callback) {
        let _root_ = this._root_ || {}, map = _root_.map, state = _root_.state;
        for (let i in map) {
          if (callback.call(this, map[i], state[i])) {
            return;
          }
        }
      },
      /**把事件冒泡给父节点，一直冒泡到树组件的根节点上，然后进行事件派发
       * @param e String 事件类型
       * @param node 触发事件的原始节点数据。冒泡的过程中始终不应该被改变
       * @param state 参数node所对应的数据状态（最多在此方法第一次被调用的时候初始化）。冒泡的过程中始终不应该被改变
       * */
      emit: function (e, node, state) {
        let $parent = this.$parent;
        state || (state = this.getState(node));
        // 把事件层层向父节点冒泡
        if ($parent && $parent.emit) {
          $parent.emit.call($parent, e, node, state);
        }
      },
      /**处理trigger事件中的具体逻辑，以及连锁触发的二次事件。
       * */
      trigger(e, node, eType) {
        let state = this.getState(node);
        switch (eType) {
          case "open":
          case "close":
            if (!state.isLeaf) this.toggle(node);
            break;
          case "toggle":
            this.toggle(node);
            break;
          default: // 点击
            e.stopPropagation();
            /**菜单模式下的规则
             * 1、叶节点不能展开/关闭，只能选中，并且不能取消选中
             * 2、非叶节点只能展开/关闭，不能选中
             *
             * 树模式下的规则
             * 1、所有节点都可以选中/取消，并且节点本身点击是不可以展开/关闭
             * */
            if (this.isMenu) {
              if (state.isLeaf) {
                this.toggleSelect(node, true);
              } else {
                this.toggle(node);
              }
            } else {
              this.toggleSelect(node);
            }
            break;
        }
      },
      /**把非数组类型的参数简单包装成数组返回，格式统一，便于操作
       * @param v 数组：直接返回，空值(null,undefined,"")：返回空数组，其它：push到数组中返回
       * */
      toArray(v) {
        return v instanceof Array ? v : v ? [v] : []
      },
      getSelectedNodes() {
        let selectedNodes = this._root_.selectedNodes;
        return this.multiple ? selectedNodes : selectedNodes[0];
      },
      /**默默地选中节点，调用此方法不会触发节点选中事件
       * @param nodes Array|Object 需要选中的节点
       * @param selected Boolean 选中的节点的展开状态
       * @param notSelected Boolean 未选中的节点的展开状态。不设置就是维持当前的展开状态
       * */
      setSelectedNodes(nodes, selected = true, notSelected = undefined) {
        // 查找节点
        this._root_.selectedNodes = nodes = this.toArray(nodes);
        nodes && this.everyNode((node, state) => {
          let k = Object.prototype.toString.call(node) == "[object String]" ? node : node[this.keyField];
          let matches = nodes.some(n => n[this.keyField] == k);
          if (matches) {
            state.isSelected = matches;
            if (selected) { // 自动展开选中的节点的所有父节点
              this.openStateParents(state);
            }
          } else {
            state.isSelected = false;
            if (notSelected === true) { // 关闭未选中的节点
            }
          }
        });
      },
      /**展开所有的父节点
       * */
      openStateParents(state) {
        state.open = true;
        let parent = state.parent;
        while (parent) {
          state = this.getState(parent);
          this.toggle(parent, true);
          parent = state.parent;
        }
      },
      /**数据变化时要执行的重构方法
       * */
      dataChange: function () {
        this._root_ = this.root;
        // 初始化数据格式
        this.serialize();
        this.setSelectedNodes(this.getSelectedNodes());
      },
      /**整理节点数据，给每个节点生成一个state对象，记录该节点的
       * */
      serialize: function () {
        let $this = this, treeData = this.dataList, state = {}, keyFiled = this.keyField, selectField = this.select,
          isRoot = this.isRoot(), parent;
        parent = this.parent;
        // 把子节点数据挂载到父节点下
        if (parent) {
          parent[this.children] = treeData;
        }
        /**当前数据是根节点的数据
         * 1、初始化根节点的root和rootState字段
         * 2、root和rootState字段使用扁平化的数据结构（map结构，方便查找）
         * */
        if (isRoot) {
          this._root_ = {
            data: [], // 数组格式全部节点
            map: {}, // 对象格式全部节点
            state: {}, // 对象格式全部节点的状态
            selectedNodes: [],
          };
        }
        let _root_ = this._root_, rootData = _root_.data, rootMap = _root_.map, rootState = _root_.state,
          selectedNodes = _root_.selectedNodes;
        // 整理节点集合，给每个节点数据保存一条对应的状态数据
        treeData.forEach((item, index) => {
          // 如果数据没有指定key，使用keyIndex作为唯一标识
          let keyIndex = ((parent && parent.keyIndex ? parent.keyIndex + "_" : "") + index),
            key = item[keyFiled],
            isLeaf = $this.isLeaf(item), isOpen = item[this.open];
          state[key] = {
            key,
            keyIndex,
            parent,
            isRoot,
            isLeaf,
            isOpen: isLeaf ? 0 : isOpen, // 默认都是关闭状态
            isClose: isLeaf ? 0 : !isOpen,
            isSelected: item[selectField]
          };
          rootData.push(item);
          rootMap[key] = item;
          rootState[key] = state[key];
          item[selectField] && (selectedNodes.push(item))
        });
        this.substates = state;
      },
      /**点击节点
       * 菜单模式下点击节点或是图标都是展开/关闭菜单
       * 树模式下点击节点是选中/取消节点，点击图标是展开/关闭
       * */
      clickNode($event, item, hit) {
        if (hit == "icon") {
          $event.stopPropagation();
        }
        if (this.type == "menu") {
          this.trigger($event, item)
        } else {
          // 点击图标是展开/关闭节点
          // 点击非图标区域是选中/取消节点
          this.trigger($event, item, hit == "icon" ? "toggle" : "")
        }
      }
    },
    watch: {
      "data": function () {
        this.dataChange();
      }
    },
    created: function () {
      this.dataChange();
    }
  };
</script>

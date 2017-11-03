<template>
  <div class="focus-panel" v-show="status == 'expand'">
    <div class="panel-content">
      <slot></slot>
    </div>
    <!-- 默认的聚焦对象，只有当面板中没有其它可以聚焦的对象，才会使用它 -->
    <a href="javascript:;" class="default-focus"></a>
  </div>
</template>
<script>
  export default {
    name: "focus-panel",
    data () {
      return {
        status: "collapse",
        //其它可以获得面板焦点的元素（这些元素不在面板范围内部）
        actionTargets: [],
        // 鼠标在这些元素上的时候，不论有没有焦点，强制视为焦点状态
        keepTargets: [],
        mouseTarget: null // 鼠标所在的元素
      };
    },
    methods: {
      /**展开下拉
       * */
      expand (stop) {
        if (this.status != "expand") {
          //展开下拉
          this.status = "expand";
          this.$nextTick(function () {
            this.setFocus();
            // 强制关闭，不再向父级派发on-collapse事件。这种情况多为父级主动调用该方法
            stop || this.$emit("on-expand", {component: this});
          });
        }
      },
      /**关闭下拉
       * */
      collapse (stop) {
        if (this.status != "collapse") {
          this.status = "collapse";
          // 强制关闭，不再向父级派发on-collapse事件。这种情况多为父级主动调用该方法
          stop || this.$emit("on-collapse", {component: this});
        }
      },
      //设置焦点，默认是把焦点设置到焦点对象上(用作背景的a标签)。如果面板上已经具有焦点元素，则不作任何处理
      setFocus (target) {
        var $focus;
        if (target) {
          this.shiftFocus(target);
        }
        //如果焦点不在面板上任何一个元素上，把焦点设置到默认元素上
        else if (!this.hasFocusEl()) {
          $focus = this.$content.find("input:visible:first");
          $focus.length ? $focus.focus() : $focus = this.$content.find("a[href]:visible:first");
          this.shiftFocus($focus.length ? $focus : this.$defaultFocus);
        }
      },
      //转让焦点。默认把焦点转让给面板的隐藏焦点对象上
      shiftFocus (target) {
        //渡让焦点前强制保留焦点，渡让的过程会导致焦点先丢失
        $(target || this.$defaultFocus).focus();
      },
      //检测面板是否具有焦点，强制保留的焦点也算是具有焦点
      hasFocus () {
        //先检测面板范围内是否具有焦点，如果没有就再检测监视的焦点对象们身上是否具有焦点
        var r = this.mouseTarget && this.keepTargets.some(item => this.contains(item, this.mouseTarget));
        return r || this.actionTargets.concat(this.$el).some(item => this.contains(item, document.activeElement));
      },
      //检测面板是否具有焦点元素
      hasFocusEl: function () {
        //先检测面板范围内是否具有焦点，如果没有就再检测监视的焦点对象们身上是否具有焦点
        var vue = this;
        return this.actionTargets.concat(this.$el).some(function (item) {
          return vue.contains(item, document.activeElement);
        });
      },
      contains: function (a, b) {
        return a == b || $.contains(a, b);
      },
      /** 把焦点面板的作用区域扩大到一些不在焦点面板区域的其它元素上。
       * 1、指定的元素获得焦点导致面板丢失焦点的时候视同面板有焦点，它们失去焦点时触发面板焦点丢失；
       * 2、焦点面板设置焦点前检测它们是否具有焦点，有的话不强行剥夺它们的焦点；
       * 3、当鼠标在这些对元素上的时候，强制保留焦点(keepFoucs++)；鼠标移走后清除此元素强制保留焦点的状态(keepFoucs--)；
       * 4、如果指定的元素在焦点面板内（或者是焦点面板本身），不执行上述所有过程。
       * */
      addActionTargets: function (targets) {
        //过滤出不在面板范围内的元素
        var $el = $(this.$el), vue = this;
        targets = $(targets).filter(function () {
          var nested;
          // 如果元素不在焦点面板范围内，继续检查焦点面板是否在元素内
          if (!vue.contains($el[0], this)) {
            // 如果焦点面板被包含在指定元素内，元素的焦点事件触发焦点面板的焦点事件，然后事件又冒泡到元素上，会造成死循环
            if (vue.contains(this, $el[0])) {
              $(this).on("focusout", function () {
                nested ? (nested = 0) : (nested = 1, $el.trigger("focusout"));
              });
            }
            //元素和焦点面板之间没有包含关系，元素的发生焦点事件后，主动触发焦点面板的焦点事件
            else {
              $(this).on("focusout", function () {
                $el.trigger("focusout");
              });
            }
            //给焦点对象设置点击强制保留焦点的功能
            vue.addFocusEvent(this);
            return true;
          }
          // 如果元素在焦点面板范围内，不需要监听它的焦点事件，自动冒泡到焦点面板上统一处理。
          return false;
        });
        this.actionTargets = this.actionTargets.concat(targets.toArray());
      },
      /**当鼠标在面板范围内的时候强制保留焦点，防止点击面板范围内的一些非焦点元素会导致焦点丢失，继而造成面板的关闭。
       * */
      addFocusEvent: function (targets) {
        var vue = this, $targets = $(targets);
        this.keepTargets = this.keepTargets.concat($targets.toArray());
        $targets.each(function () {
          $(this).on("mouseover", function (e) {
            //点击面板范围内的一些不可获取焦点的元素会导致导致面板焦点丢失，此时强制保留焦点
            vue.mouseTarget = e.target;
          }).on("mouseout", function (e) {
            //鼠标操作结束后返还焦点
            vue.mouseTarget = null;
            //使用shiftFocus方法，把焦点默默地设置到隐藏焦点元素上
            vue.hasFocusEl() || vue.shiftFocus();
          });
        });
      }
    },
    /**dom初始化完成后定义操作
     * 这是一个内部失去焦点后自动关闭的面板（一般用作下拉面板）
     * */
    mounted: function () {
      var vue = this, $el = $(this.$el);
      this.$content = $el.find(".panel-content");
      this.$defaultFocus = $el.children(".default-focus");
      $el.on("focusout", function () {
        //焦点对象如果不在面板中，并且也不在非面板区域内的其它特定焦点对象上，关闭面板
        if (!vue.hasFocus()) {
          vue.collapse();
        }
      });
      this.addFocusEvent($el);
    }
  }
</script>

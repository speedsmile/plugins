<!-- 滑动数字特效 -->
<template>
  <div class="slide-number">
    <div class="title">
      <slot></slot>
    </div>
    <transition-group tag="div" class="num-group"
                      mode="in-out"
                      @before-enter="beforeEnter"
                      @enter="enter"
                      @leave="leave"
    >
      <div v-for="(num,i) in numString" :key="i" class="num-view">
        <div class="nums-wrapper" :style="{top:-num+'00%'}">
          <div class="single-num" v-for="n in 10" v-text="n-1"></div>
        </div>
      </div>
    </transition-group>
  </div>
</template>
<script>
  var Transition = {
    methods: {
      beforeEnter: function (el) {
        el.style.opacity = 0;
        var deg = Math.random() * 90 - 45;
        Velocity(el, {
          rotateZ: deg + "deg",
          translateX: '-1em',
          // opacity: 0
        }, {duration: 0});
      },
      enter: function (el, done) {
        Velocity(el, {
          rotateZ: "0",
          translateX: '0',
          opacity: 1
        }, {complete: done, duration: 1000})
      },
      leave: function (el, done) {
        Velocity(el, {
          translateX: '1em',
          opacity: 0
        }, {complete: done, duration: 1000})
      }
    }
  };
  export default{
    name: "slide-number",
    props: ["data", "char", "minlength"],
    data: function () {
      return {num: null}
    },
    computed: {
      /**数字分开显示，返回数字的字符串。不足指定为数的补0
       * */
      numString(){
        var num = this.num;
        if(num == null)return;
        var minlength = this.minlength != null ? this.minlength : 5,
            char = this.char != null ? this.char : "0";
        num += "";
        for(var i = 0, l = minlength - num.length; i < l; i++){
          num = char + num;
        }
        return num;
      }
    },
    beforeUpdate: function(){
      var data = this.data;
      if(data){
        data.num != null && (this.num = data.num);
      }
    },
    extends: Transition
  }
</script>
<style lang="less" scoped>
  @width: .65em;
  @height: 1em;
  @gap: 22REM;
  .slide-number {
    display: flex;
    align-items: center;
    margin-bottom: 100REM;
    &:last-child {
      margin-bottom: 100REM;
    }
    > .title {
      margin-right: 50REM;
      font-size: 60REM;
    }
  }

  .num-group {
    display: flex;
    margin-left: 0;
    height: 1em;
    font-size: 150REM;
    line-height: 1em;
    color: #fff;
  }

  .single-num {
    margin-right: 0;
  }

  .num-view, .single-num {
    margin-right: @gap;
    width: @width;
    height: @height;
    line-height: @height;
    background: #030c2e;
  }

  .num-view {
    position: relative;
    overflow: hidden;
    .nums-wrapper {
      position: absolute;
      transition: all 1s .5s ease;
    }
  }

  .alternate {
    .nums-wrapper {
      position: relative;
    }
    .front, .back {
      position: absolute;
      left: 0;
      top: 0;
    }
    .front {
      z-index: 2;
      &inverse {
        z-index: 1;
      }
    }
  }

</style>

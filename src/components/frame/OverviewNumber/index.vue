<template>
  <div class="overview-num">
    <!--<div class="bg-img"></div>-->
    <img src="./overview-num.png" alt="" class="bg-img">
    <div class="table-cell">
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<style lang="less">
  .overview-num{
    @width: 616REM;
    @height: 300REM;
    @padding-lr: 58REM;
    @padding-top: 60REM;
    @padding-bottom: 45REM;
    @add-width: @padding-lr * 2;
    @add-height: @padding-top + @padding-bottom;
    @bottom: 94REM;
    position: relative;
    display: table;
    padding: @padding-top @padding-lr @padding-bottom;
    width: 100%;
    .bg-img{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: (@width + @add-width) / @width * 100%;
      height: (@height + @add-height) / @height * 100%;
    }
    .table-cell{
      display: table-cell;
      text-align: center;
      vertical-align: middle;
    }
    .content{
      position: relative; // 内容要定位，不然会被绝对定位的背景层挡住
      display: inline-block;
      .small-info{
        margin-bottom: 15REM;
        font-size: 14REM;
        line-height: 1;
        color: #fff;
      }
    }
    .slide-number{
      display: inline-block;
      .comma{
        align-self: baseline;
        margin: 2REM;
        &:first-child{
          font-size: 30REM;
        }
      }
    }
    em{
      margin-left: 20REM;
      font-style: normal;
    }
    .num-group, em{
      color: #f8c713;
    }
    .num-group{
      font-size: 62REM;
    }
    .num-view{
      margin-right: 5REM;
      background-color: transparent;
      &:last-child{
        margin-right: 0;
      }
    }
    .single-num{
      background-color: #2d2e5a;
    }
  }
</style>

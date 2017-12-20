<template>
  <div class="overview-num">
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>
<style lang="less">
  .overview-num{
    @width: 616REM;
    @height: 300REM;
    @padding-lr: 58REM;
    @bottom: 94REM;
    display: table-cell;
    width: @width;
    height: @height;
    padding-bottom: @bottom;
    text-align: center;
    vertical-align: bottom;
    background: url("overview-num.png") no-repeat center/contain;
    .content{
      display: inline-block;
      max-width: @width - @padding-lr * 2;
      .small-info{
        margin-bottom: 15REM;
        font-size: 14REM;
        line-height: 1;
        color: #fff;
        text-align: right;
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

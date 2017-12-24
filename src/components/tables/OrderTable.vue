<template>
  <div is="table" class="sale-table">
    <slot name="caption"></slot>
    <div is="tbody">
      <slot name="th"></slot>
      <slot name="list">
        <tr v-for="item in data">
          <td v-text="item.name"></td>
          <td v-text="item.total"></td>
          <td>{{toPrecision(item.completionRate)}}%</td>
          <td><span class="trigle-align-text">{{rateCompare(item.yoyRate)}}%</span><i
            :class="item.yoyRate>0?'trigle-up':'trigle-down'"></i></td>
        </tr>
      </slot>
    </div>
  </div>
</template>
<script>
  export default {
    name: "OrderTable",
    props: ["data"],
    methods: {
      toPrecision(n){
        return parseFloat((n * 100).toPrecision(12))
      },
      rateCompare(n){
        return this.toPrecision(Math.abs(n))
      }
    }
  }
</script>
<style lang="less">
  .sale-table {
    @font-size: 36REM;
    @padding-lr: 25REM;
    @cell-height: 52REM;
    width: 100%;
    caption {
      position: relative;
      font-size: @font-size;
      line-height: @cell-height;
      color: #010000;
      text-align: left;
      border-bottom: 2px solid #f8c713;
      &.orange, .orange {
        background-color: #fa520a;
      }
      &.blue, .blue {
        background-color: #01ebf4;
      }
      &.yellow, .yellow {
        background-color: #fdef21;
        border-bottom-color: #f0f;
      }
    }
    .subtitle, th {
      font-size: 18REM;
    }
    .subtitle {
      position: absolute;
      right: @padding-lr;
      bottom: (@cell-height - @font-size) / 2;
      line-height: 1;
    }
    th {
      color: #fff;
    }
    caption, th, td {
      height: @cell-height;
      padding-left: 10REM;
      padding-right: 10REM;
      vertical-align: middle;
      &:first-child {
        padding-left: @padding-lr;
      }
      &:first-child {
        padding-right: @padding-lr;
      }
    }
    tr {
      background-color: #3a3166;
      &:nth-child(2n) {
        background-color: #241a56;
      }
    }
    td {
      font-size: 14REM;
      color: #fff;
      text-align: center;
      &:nth-child(2) {
        color: #f0f;
      }
      &:nth-child(3) {
        color: #2ffff4;
      }
    }
    // 红色的上三角
    .trigle-up {
      border-style: solid;
      border-width: 0 7REM 10REM;
      border-color: transparent transparent #ff6258;
    }
    // 绿色的下三角
    .trigle-down {
      border-style: solid;
      border-width: 10REM 7REM 0;
      border-color: #61d567 transparent transparent;
    }
    .trigle-up, .trigle-down {
      display: inline-block;
      font-size: 0;
    }
    .trigle-align-text {
      display: inline-block;
      min-width: 4em;
    }
  }
</style>

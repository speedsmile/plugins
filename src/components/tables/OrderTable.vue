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
          <td><span class="trigle-align-text">{{rateCompare(item.yoyRate)}}%</span><i :class="item.yoyRate>0?'trigle-up':'trigle-down'"></i></td>
        </tr>
      </slot>
    </div>
  </div>
</template>
<script>
  export default {
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

<template>
  <div class="light-frame">
    <img src="./bg.png" class="bg-img" alt="">
    <ul class="content">
    </ul>
  </div>
</template>
<style lang="less">
  .light-frame{
    @font-size: 36REM;
    @marquee-height: 130REM;
    @padding-top: 35REM;
    @padding-bottom: 48REM;
    @padding-lr: 460REM;
    padding: @padding-top @padding-lr @padding-bottom;
    height: @marquee-height;
    .bg-img{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
    }
    .content{
      @text-height: @marquee-height - @padding-top - @padding-bottom;
      position: relative;
      margin: 0 auto;
      width: 1000REM;
      height: @text-height;
      line-height: @text-height;
      font-size: @font-size;
      color: #f8c713;
      overflow: hidden;
      >li{
        position: absolute;
        left: 0;
        top: -999em;
        margin: 0 auto;
        line-height: inherit;
        white-space: nowrap;
      }
    }
  }
</style>

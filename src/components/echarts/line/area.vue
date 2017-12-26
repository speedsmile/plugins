<template>
    <div>

    </div>
</template>
<script>
//  import ""
  var chartDom, rsize = window.responser.responseSize
  ;

  function getOptions(v){
    var option, markData = [],
      lineFontSize = rsize(14),
      legendColors = ["#f9fc24", "#fa528a", "#1eb8cf"], legendFontColor = "#7573c4",
      yColor = "#212173", xColor = yColor, xCircleColor = "#716efb",
      arrSeries = []
    ;
    lineFontSize < 12 && (lineFontSize = 12);
    option = {
      color: ["#d34176"],
      grid: {
        left: '6%',
        right: '6%',
        top: "22%",
        bottom: 0,
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            interval: 0,//强制显示所有x轴上的类目标签
            textStyle: {color: "#999", fontSize: rsize(20)}
          },
          data: []
        }
      ],
      yAxis: [
        {
          type: 'value',
          offset: rsize(40),
          splitLine: {
            show: false
          },
          axisLabel: {
            textStyle: {color: "#999", fontSize: rsize(20)},
          }
        }
      ]
    };

    option.xAxis[0].data.push(DateFormat(item.name, "YYYYMMDD").toString("MM.DD"));
    data.forEach(function (item, i) {
      // 处理数据为null的情况（null不会显示数据和标记）
      var num = +item.num || 0,
        series = {
            type: 'line',
            animationDurationUpdate: 1500,
            animationEasingUpdate: "backIn",
            symbolSize: rsize(10),
            smooth: true,
            label: {
              normal: {
                show: false,
                position: 'top',
                textStyle: {fontSize: lineFontSize, color: "#fff"}
              }
            },
            areaStyle: {
              normal: {
                // shadowColor: "rgba(211, 65, 118, .6)",
                // shadowBlur: 30,
                opacity: 1
              }
            },
            data: []
          };
      series.data.push(num);
      markData.push({
        xAxis: i,
        yAxis: num,
        value: num,
        symbolSize: function (value) {
          // 最少4个字符的大小
          var l = (value + "").length + 2, w = (l > 4 ? l : 4) * lineFontSize * .85;
          return [w * .8, w * .65]
        },
        label: {
          normal: {
            textStyle: {
              fontSize: rsize(12),
              color: "#fff"
            }
          }
        }
      });
    });
//    option.series[0].markPoint = {
//      data: markData,
//      animationDurationUpdate: 1000,
//      animationEasingUpdate: "backIn"
//    };
  }
  export default {
    props: ["data"],
    data(){
      return {}
    },
    watch: {
      data: function(v){
        this.paint(v)
      }
    },
    methods: {
      paint(v){
        chartDom && chartDom.setOption(this.getOptions(v))
      }
    },
    mounted(){
      chartDom = echarts.init(this.$el)
    }
  }
</script>
<style lang="">

</style>

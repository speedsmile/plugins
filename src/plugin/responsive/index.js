/**处理页面响应式rem布局，越早调用越能减少页面抖动
 * Created by weikaiwei on 2017/12/18.
 * @param Object {width: 设计稿的宽度, height: 设计稿的高度, scale: 1（默认）,等比例缩放}
 *
 * */
module.exports = function({width, height, minWidth, maxWidth, scale = 1, onResize}){
  let baseWidth = width;
  function setBase(){
    /**基准 * 页面宽度 / 设计稿宽度
     * 设计稿： 750 * 1334
     * 以100px作为rem的基准，谷歌不支持12px以下（其它浏览器没有这个限制）
     * 例： a * b，用作高宽的时候，a和b任意一方小于12px，都会使用12px来计算；
     * 如果用作font-size，a和b没有要求，但是运算的结果如果小于12px，则计算结果是12px
     *
     * rem计算规则：
     * 1、设计稿尺寸是基于2倍的retina屏幕，基准比例换算的时候除以二
     * 2、如果客户终端屏幕尺寸小于等于基准值，按照基准值(100)来显示；大于基准值则等比放大
     *
     * 兼容：使用华为浏览器，第一次打开标签加载网页时，window.innerWidth和window.innerHeight不准确，即使延时处理也不能确定具体的时间
     * document.body.clientWidth是准确的
     * */
    let rootEl = (document.documentElement || document.body),
      fullWidth = window.innerWidth, fullHeight = window.innerHeight,
      useWidth = fullWidth, useHeight, rem;
    /**为了保证实际尺寸的比例和理想尺寸的比例一致，以实际宽高中较小的值最为基数，按比例计算出另一个基准数
     * 以宽度/高度为基准比例，实际比例大于理想比例，说明实际的高度较小，应该根据高度反推算出宽度
     */
    if(scale){ // 宽高等比缩放算法
      let baseRatio = baseWidth / height, terminalRatio = fullWidth / fullHeight;
      if(terminalRatio > baseRatio){
        useWidth = fullHeight * baseRatio;
      }
      useHeight = useWidth / baseRatio
    }
    maxWidth != undefined && (useWidth = Math.min(useWidth, maxWidth)); // 设置了最大尺寸
    minWidth != undefined && (useWidth = Math.max(useWidth, minWidth)); // 设置了最小尺寸
    rem = 100 * (useWidth / baseWidth);
    rootEl.style.fontSize = rem + "px";
    window.responser = {
      /**根据设计稿理想尺寸和设备实际尺寸的比例，等比计算出理想尺寸所对应的设备尺寸
       * */
      responseSize: function(size, option){
        let {reverse, max, min} = option || {};
        size = reverse ? size * (baseWidth / useWidth) : size / (baseWidth / useWidth);
        max != undefined && (size = Math.min(size, max)); // 设置了最大尺寸
        min != undefined && (size = Math.max(size, min)); // 设置了最小尺寸
        return size;
      }
    };
    onResize && onResize({width: useWidth, height: useHeight, fullWidth, fullHeight});
  }
  window.addEventListener("resize", setBase);
  setBase();
};

/**对setTimeout和setInterval的封装。执行调度时，目标不存在的话自动销毁这个调度器，以节约资源
 * Created by weikaiwei on 2017/12/25.
 */
/**@param f Function 只能是setTimeout或者setInterval
 * @param clearFunction Function 只能是clearTimeout或者clearInterval
 * */
function fun(f, clearFunction){
  return (function(){
    /**
     * @param cb Function 回调函数。如果没有指定test方法，
     * @param time Number 时间间隔
     * @param test Function 测试函数，如果返回false或者报错，销毁调度
     * */
    return function (cb, time, option){
      var id = f(function(){
        var t = 1, {test} = option || {};
        if(test){
          try{
            t = test()
          }catch(e){
            t = 0
          }
          if(t){
            cb()
          }else{
            clearFunction(id)
          }
        }else{
          try{
            cb()
          }catch (e){
            clearFunction(id)
          }
        }
      }, time);
    }
  })()
}
let timeout = fun(setTimeout, clearTimeout);
let interval = fun(setInterval, clearInterval);
export {timeout, interval};

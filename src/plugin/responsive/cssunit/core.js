/**作为postcss的插件来转换css单位，比如从A(px)转B(rem)，可以自定义单位的转换规则
 * 一个实例支持把N(N>0)种单位经过M(M>0,M<=N)种规则转换成同一种单位
 * Created by weikaiwei on 2017/12/15.
 */
// 默认处理规则，把第一个参数原样返回
let fun = (value, unit) => value + unit;
/**
 * source: A单位。类型可以是字符串、数组、对象，可以把指定的多种单位经过某种规则转换成B单位
       String: 多个单位使用分隔符隔开，大小写严格区分，这些单位使用统一的转换规则
       Object: key是A单位，参考String类型；value是转换规则（参考rule），不指定则使用统一的转换规则
       如果不指定则无需转换
 * rule: 统一的转换规则，没有指定转换规则的A单位都使用这个规则，function(单位值:Number)，返回转换后的结果，带上单位。不指定原样返回
 * split: 分隔符。默认/[,|\s]+/
 * */
function Rule(){
  this.initRules(...arguments)
}
Rule.prototype = {
  // 初始化规则
  initRules({source, rule = fun, split = /[,|\s]+/}){
    Object.assign(this, {source, rule, split});
    this._rules = [];
    let _toString = Object.prototype.toString;
    if(source){
      if(_toString.call(source) == '[object Object]'){
        for(let k in source){
          this.addRule(k, source[k] || this.rule)
        }
      }else{
        if(_toString.call(source) == '[object String]'){
          source = [source]
        }
        for(let i in source){
          this.addRule(source[i], this.rule)
        }
      }
    }
  },
  addRule(units, rule){
    units = units.split(this.split).map(unit => "(?:" + unit + ")").join("|");
    // 单位严格区分大小写
    let reg = new RegExp("(\\d*\\.?\\d+)(" + units + ")", "g");
    this._rules.push([reg, rule]);
  },
  /**把指定css文本按照规则进行转换，然后返回
   * @param cssText 待转换的css文本
   * @return 转换后的css文本
   * */
  parse(cssText){
    for(let rule of this._rules){
      cssText = cssText.replace(rule[0], (a, value, unit) => {
        return rule[1](value, unit)
      })
    }
    return cssText
  }
};
// new Rule({source: "px|pt|em", rule: function(value, unit){return value / 10 + unit}}).parse("border:12.23px solid #fff;font-size:15pt;font-size:15em;")
module.exports = Rule;

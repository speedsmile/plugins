/**Date 返回一个Date对象，在该对象上重写了toString方法以便支持各种模式格式化方式
 * 添加了convert方法：可以使用指定模式来转换日期对象
 * 添加toDate方法：指定的日期对象的基础上进行日期时间上的偏移
 * Created by weikaiwei on 2016/12/19.
 */
let type = require("./type"), extend = require("./extend");
function m() {
  // 日期简写模式的关键字全定义
  let methods = {
    y: "FullYear",
      Y: "FullYear",
      year: "FullYear",
      m: "Month",
      M: "Month",
      month: "Month",
      d: "Date",
      D: "Date",
      date: "Date",
      h: "Hours",
      H: "Hours",
      hours: "Hours",
      i: "Minutes",
      I: "Minutes",
      minute: "Minutes",
      s: "Seconds",
      S: "Seconds",
      second: "Seconds",
      ms: "Milliseconds"
  },
    Format = {
    // 对应的Date对象方法，获取用的get系列，设置用的set系列
    /**@param s String 简写模式
     * @return String 返回简写模式对应的get方法
     * */
    getGetter(s){
      let m = methods[s];
      return m ? "get" + m : "";
    },
    getSetter(s){
      let m = methods[s];
      return m ? "set" + m : "";
    },
    matches: {

    }
  };
  // 基类，扩展
  let ext = {
    /**把字符串按照特定的模式解析成日期对象
     * @param dateString String|number时间戳 必须 日期字符串
     * @param format String 可选 解析格式。不传入则按照常规的方式解析
     * */
    parseDate: function (dateString, format) {
      let date;
      if (type.isDate(dateString)) date = dateString;
      // 时间戳
      else if (type.isNumber(dateString)) {
        date = new Date(dateString);
      } else if (!format) { // TODO 待优化
        date = new Date(dateString.replace(/[^\d\s:]+/g, "/").replace(/(\s)+/g, "$1"));
      } else {
        date = this.setNativeDate(new Date(), {h: 0, i: 0, s: 0, ms: 0});
        /**读取一个模式，然后读取一个日期字符（2者的位置索引必须一致）
         * 1、当前模式和保存的模式不一致，模式匹配结束
         *  1.1、如果保存的模式是一个有效模式，设置该模式的时间为累计的日期字符
         *  1.2、保存当前模式，清空累计的日期字符
         *  1.3、继续读取下一个模式
         * 2、当前的模式和保存的模式一致，模式没有结束
         *  2.1、累计一个日期字符
         *  2.2、继续读取下一个模式
         * */
        let getSetter = Format.getSetter, charts = "", current, store, setterName;
        for (let i = 0, l = format.length; i < l; i++) {
          current = format.charAt(i);
          store === undefined && (store = current);
          if(current != store){
            if(setterName = getSetter(store)){
              date[setterName](setterName == "setMonth" ? charts - 1 : charts);
            }
            store = current;
            charts = dateString.charAt(i);
          }else{
            charts += dateString.charAt(i);
          }
        }
        // 设置最后一轮模式检测的时间
        if (setterName = getSetter(current) && charts) {
          date[getSetter(current)](charts);
        }
      }
      if (type.isInvalidDate(date)) throw "日期格式不正确";
      return extend(date, ext);
    },
    /**把日期对象（或者是合法的日期字符串、时间戳）转换成指定模式的日期对象
     * @param format 日期格式化模式 模式匹配过程严格按照年月日时分秒（YMDHis）的顺序（format中只要出现就行），只要一个模式匹配不上，该模式后面的模式全部忽略
     * 无参数：this是被转换的日期对象
     * 1个参数：第一个是转换的格式，this是被转换的日期对象
     * 2个参数：第一个是要转换的日期对象，第二个是转换的格式
     * */
    convert: function (date, format) {
      if (arguments.length < 2) {
        if (type.isDate(this)) {
          date = this;
          format = "YMDHis";
        } else {
          date = this;
        }
      }
      if (type.isInvalidDate(date)) {
        if (type.isString(date)) {
          date = new Date(date.replace(/[^\d\s:]+/g, "/").replace(/(\s)+/g, "$1"));
        } else if (date == undefined) {
          date = new Date();
        } else {
          date = new Date(date);//其它格式，比如时间戳等
        }
      }
      //先把对象转换成普通的日期对象，然后再转成指定格式的日期对象
      let map = [["Y", "YYYY"], ["M", "/MM"], ["D", "/DD"], ["H", " HH"], ["i", ":ii"], ["s", ":ss"]]
        , char, chars = "";
      if (format) {
        for (let i = 0, l = map.length; i < l; i++) {
          char = map[i];
          // 只要一个模式匹配不上，该模式后面的模式全部忽略
          if (format.indexOf(char[0]) == -1)break;
          chars += char[1];
        }
        date = new Date(this.toString(date, chars));
      }
      return extend(date, ext);
    },
    /**把日期对象（或者是合法的日期字符串、时间戳）格式化输出成指定的模式字符串
     * 支持2个参数：
     * 无参数：this是被转换的日期对象
     * 1个参数：第一个是转换的格式，this是被转换的日期对象
     * 2个参数：第一个是要转换的日期对象，第二个是转换的格式
     * */
    toString: function (date, format) {
      arguments.length < 2 && (format = date, date = this);
      date instanceof Date || (date = this.parseDate(date));
      // 前缀补0
      function dateFormat(n, len) {
        let arr = n.toString().split("."), integer = arr[0], decimal = arr[1];
        for (let i = 0, l = len - integer.length; i < l; i++) {
          integer = "0" + integer;
        }
        return integer;
      }
       // TODO 待优化
      let reg = /Y{1,4}|M{1,2}|D{1,2}|H{1,2}|i{1,2}|s{1,2}/ig,
        y = date.getFullYear(),
        M = date.getMonth() + 1,
        d = date.getDate(),
        h = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds(),
        arr = [y, M, d, h, m, s], map = "YMDHIS";
      return (format || "YYYY-MM-DD HH:II:SS").replace(reg, function (a) {
        let f = a.charAt(0), index = map.indexOf(f);
        // 除了年份，其他时间位数不够自动前缀补0
        return f == "Y" ? arr[index].toString().slice(-a.length) : dateFormat(arr[index], a.length);
      });
    },
    /**在指定的日期对象的基础上进行日期时间上的偏移
     * 指定一个日期，给定一个偏移量，计算出指定日期在指定的日上偏移后的新日期对象
     * @param date，Date 指定的日期，只有一个参数的情况下this指代date
     * @param options, Object 偏移量{year: , month: , date: }
     *      如果offset是数值类型，则视为天数
     * @return 返回偏移后的日期对象，不改变当前日期对象
     * */
    toDate: function (date, options) {
      arguments.length < 2 && (options = date, date = this);
      date = this.parseDate(date || new Date);
      options || (options = {});
      type.isNumber(options) && (options = {date: options});
      let nOpts = {};
      // 对每个时间进行参数累加运算
      for(let o in options){
        let getterName = Format.getGetter(o);
        if(getterName){
          nOpts[o] = date[getterName]() + options[o];
        }
      }
      // 使用时间偏移的结果构造新的时间对象
      return this.parseDate(this.setNativeDate(new Date(), nOpts));
    },
    /**给出一组参数，批量重置日期对应的值。
     * 和toDate方法的区别：当指定的时间是非负数时，直接覆盖对应时间上的时间；toDate方法是在当前基础上累加。
     * 参数是负数则和toDate方法一样在当前时间上累加
     *
     * @param date，Date 指定的日期对象，只有一个参数的情况下this指代date
     * @param options, Object 重置参数{year: , month: 0—11, date: ,hour: , minute, second: }
     * @return Date 返回重置后的日期对象，不改变当前日期对象
     * */
    setDate: function (date, options) {
      arguments.length < 2 && (options = date, date = this);
      date = this.parseDate(date || new Date);
      options || (options = {});
      type.isNumber(options) && (options = {date: options});
      let nOpts = {};
      // 对每个时间进行参数累加运算
      for(let o in options){
        let getterName = Format.getGetter(o);
        if(getterName){
          // 小于0的时间在原来的时间上进行偏移，否则直接覆盖
          nOpts[o] = options[o] < 0 ? date[getterName]() + options[o] : options[o];
        }
      }
      return this.parseDate(this.setNativeDate(new Date(), nOpts));
    },
    /**给出一组参数，批量重置日期对应的值
     * @param date，Date 指定的日期，只有一个参数的情况下this指代date
     * @param options, Object 重置参数{year: , month: 0—11, date: ,hour: , minute, second: }
     * @return Date 原始的Date类型。返回重置后的日期对象，不改变当前日期对象
     * */
    setNativeDate: function (date, options) {
      arguments.length < 2 && (options = date, date = this);
      let nDate = new Date(date.getTime());
      options || (options = {});
      for(let o in options){
        let setterName = Format.getSetter(o);
        if(setterName){
          nDate[setterName](options[o]);
        }
      }
      return nDate;
    },
    /**获取当前的日期（默认YMDHis），支持format模式
     * */
    now: function (format) {
      let now = new Date();
      return format ? this.convert(now, format) : extend(now, ext);
    },
    toNative: function (date) {
      arguments.length < 1 && (date = this);
      return new Date(date.getTime());
    }
  };
  /**支持使用函数调用的方式和new方式来生成一个对象实例
   * 原生Date对象初始化最多支持6个参数
   * */
  function F() {
    //先返回一个日期对象，然后重写这个日期对象的方法
    let date;
    switch (arguments.length) {
      case 1:
        if (type.isString(arguments[0])) {
          date = ext.parseDate(arguments[0]);
        } else {
          date = new Date(arguments[0]);
        }
        break;
      case 2:
        if (type.isString(arguments[0]) && type.isString(arguments[1])) {
          date = ext.parseDate(arguments[0], arguments[1]);
        } else {
          date = new Date(arguments[0], arguments[1]);
        }
        break;
      case 3:
        date = new Date(arguments[0], arguments[1], arguments[2]);
        break;
      case 4:
        date = new Date(arguments[0], arguments[1], arguments[2], arguments[3]);
        break;
      case 5:
        date = new Date(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
        break;
      case 6:
        date = new Date(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
        break;
      default:
        date = new Date();
    }
    extend(date, ext);
    return date;
  }
  extend(F, Date, ext);
  return F;
}
module.exports = m();

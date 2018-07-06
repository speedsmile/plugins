/**Date 返回一个Date对象，在该对象上重写了toString方法以便支持各种模式格式化方式
 * 添加了convert方法：可以使用指定模式来转换日期对象
 * 添加toDate方法：指定的日期对象的基础上进行日期时间上的偏移
 * Created by weikaiwei on 2016/12/19.
 */
let type = require("./type");
function m () {
  // 日期简写模式的关键字全定义
  let Format = {
      alias: [
        ["y", "Y", "year"],
        ["m", "M", "month"],
        ["d", "D", "date"],
        ["h", "H", "hour"],
        ["i", "I", "minute"],
        ["s", "S", "year"],
        ["y", "Y", "second"],
        ["ms"]
      ],
      methods: {
        y: "FullYear",
        m: "Month",
        d: "Date",
        h: "Hours",
        i: "Minutes",
        s: "Seconds",
        ms: "Milliseconds"
      },
      // 对应的Date对象方法，获取用的get系列，设置用的set系列
      /**@param s String 简写模式
       * @return String 返回简写模式对应的get方法
       * */
      getGetter(s){
        let m = this.getMethodName(s);
        return m ? "get" + m : "";
      },
      getSetter(s){
        let m = this.getMethodName(s);
        return m ? "set" + m : "";
      },
      /**从用户模式中取出模式对应的方法名
       * */
      getMethodName(s){
        let name;
        this.alias.some(_ => {
          if(_.indexOf(s) > -1){
            name = this.methods[_[0]];
            return true;
          }
        });
        return name;
      },
      /**返回标准名称在用户模式中定义的名称。
       * 一个标准名称有好几个别名，比如年份的标准名称是y，别名有Y、year
       * 假设用户模式是{ year, m }，要检测的是month，应该返回m
       * @param s String 标准名称
       * @param options Object 用户模式
       * @return String 标准名称在用户模式中的名称
       * */
      getOptionName(s, options){
        // 找到标准名称的所有别名
        let alias;
        this.alias.some(_ => {
          if(_.indexOf(s) > -1){
            alias = _;
            return true;
          }
        });
        // 在用户模式中查找在所有别名中模式名称，然后返回
        for(let i in options){
          if(alias.indexOf(i) > -1){
            return i;
          }
        }
      },
      matches: {}
    },
    /**给出一组参数，批量重置日期对应的值
     * @param date，Date 指定的日期，只有一个参数的情况下this指代date
     * @param options, Object 重置参数{y: , m: 0—11, d: ,h: , i, s, ms }
     * @return Date 原始的Date类型。返回重置后的日期对象，不改变当前日期对象
     * */
    setDate = function (date, options) {
      arguments.length < 2 && (options = date, date = this);
      let nDate = new Date(date.getTime());
      options || (options = {});
      /**特别注意：年月的偏移都会导致日期date不正确
       * 1、年份变更：闰年和非闰年的变更会影响2月的最大日期。今年是2月29日，往前往后一年都只能是2月28日
       * 2、月份变更：3月31日的加一个月应该是4月30。如果是4月31，就会变成5月1
       * 解决方案：
       * 1、保存当前的日为date1，然后把date设置成1（小于29即可）
       * 2、设置年份和月份，设变动后的当月最大的日为date2。
       * 3、把当前的date设置成date1和date2中较小的一位
       * */
      let d1 = nDate.getDate(), yName = Format.getOptionName("y", options), mName =  Format.getOptionName("m", options);
      nDate.setDate(1);
      yName && nDate.setFullYear(options[yName]);
      mName && nDate.setMonth(options[mName]);
      // 当月的最大日期：月份加1，然后日期设置成0
      nDate.setMonth(nDate.getMonth() + 1);
      nDate.setDate(0);
      // 从年月偏移前后的日期中取出较小的一位，然后设置为当前日期
      nDate.setDate(Math.min(d1, nDate.getDate()));
      for (let o in options) {
        let setterName = Format.getSetter(o);
        // 年份和月份设置完成，不再重复设置
        if (setterName && setterName != Format.methods.y && setterName != Format.methods.m) {
          nDate[setterName](options[o]);
        }
      }
      return this.parseDate(nDate);
    };
  // 基类，扩展
  let ext = {
    /**把字符串按照特定的模式解析成日期对象
     * @param dateString String|number时间戳 必须 日期字符串
     * @param format String 可选 解析格式。不传入则按照常规的方式解析
     * */
    parseDate: function (dateString, format) {
      let date;
      if (type.isDate(dateString)) {
        date = dateString;
      } else if (type.isNumber(dateString)) {// 时间戳
        date = new Date(dateString);
      } else if (!format) { // TODO 待优化
        date = new Date(dateString.replace(/[^\d\s:]+/g, "/").replace(/(\s)+/g, "$1"));
      } else {
        date = setDate.call(this, new Date(), {h: 0, i: 0, s: 0, ms: 0});
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
          if (current != store) {
            if (setterName = getSetter(store)) {
              date[setterName](setterName == "setMonth" ? charts - 1 : charts);
            }
            store = current;
            charts = dateString.charAt(i);
          } else {
            charts += dateString.charAt(i);
          }
        }
        // 设置最后一轮模式检测的时间
        if (getSetter(current) && charts) {
          date[getSetter(current)](charts);
        }
      }
      if (type.isInvalidDate(date)) throw "日期格式不正确";
      return Object.assign(date, ext);
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
      return Object.assign(date, ext);
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
      let reg = /Y{1,4}|M{1,2}|D{1,2}|H{1,2}|i{1,2}|s{1,2}/ig,
        map = {
          Y: date.getFullYear(),
          M: date.getMonth() + 1,
          D: date.getDate(),
          H: date.getHours(),
          I: date.getMinutes(),
          S: date.getSeconds()
        };
      return (format || "YYYY-MM-DD HH:II:SS").replace(reg, function (a) {
        let f = a.charAt(0).toUpperCase();
        return ("0" + map[f]).slice(-a.length);
      });
    },
    /**在指定的日期对象的基础上进行日期时间上的偏移
     * 指定一个日期，给定一个偏移量，计算出指定日期在指定的日上偏移后的新日期对象
     * @param date Date 指定的日期，只有一个参数的情况下this指代date
     * @param options Object 偏移量{year: , month: , date: }
     *      如果options是数值类型，则视为天数
     * @param m Boolean
     *      false 叠加模式，小于0在当前时间上叠加，大于0直接覆盖当前时间
     *      true 覆盖模式，小于0在当前时间上叠加，大于0直接覆盖当前时间
     * @return 返回偏移后的日期对象，不改变当前日期对象
     * */
    toDate: function (date, options, m) {
      arguments.length < 3 && (options = date, date = this);
      date = this.parseDate(date || new Date);
      options || (options = {});
      type.isNumber(options) && (options = {date: options});
      let nOpts = {};
      // 对每个时间进行参数累加运算
      for (let o in options) {
        let getterName = Format.getGetter(o);
        if (getterName) {
          // 小于0的时间在原来的时间上进行偏移，否则直接覆盖
          nOpts[o] = m ? options[o] < 0 ? date[getterName]() + options[o] : options[o] : date[getterName]() + options[o];
        }
      }
      // 使用时间偏移的结果构造新的时间对象
      return setDate.call(this, date, nOpts);
    },
    /**给出一组参数，批量重置日期对应的值。
     * 和toDate方法的区别：当指定的时间是非负数时，直接覆盖对应时间上的时间；toDate方法是在当前基础上累加。
     * 参数是负数则和toDate方法一样在当前时间上累加
     *
     * @param date Date 指定的日期对象，只有一个参数的情况下this指代date
     * @param options Object 重置参数{year: , month: 0—11, date: ,hour: , minute, second: }
     * @return Date 返回重置后的日期对象，不改变当前日期对象
     * */
    setDate: function (date, options) {
      arguments.length < 2 && (options = date, date = this);
      return this.toDate(date, options, true);
    },
    /**获取当前的日期（默认YMDHis），支持format模式
     * */
    now: function (format) {
      let now = new Date();
      return format ? this.convert(now, format) : Object.assign(now, ext);
    },
    toNative: function (date) {
      arguments.length < 1 && (date = this);
      return new Date(date.getTime());
    }
  };

  /**支持使用函数调用的方式和new方式来生成一个对象实例
   * 原生Date对象初始化最多支持6个参数
   * */
  function F () {
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
    Object.assign(date, ext);
    return date;
  }

  Object.assign(F, Date, ext);
  return F;
}
module.exports = m();

/**
 * Created by weikaiwei on 2017/6/6.
 * 依赖axios的api
 * 必要参数：1、ajax对象；2、setData方法
 */
export default function listModel(o) {
  this.initData = o;
  this.clearData();
}
listModel.prototype = {
  /**向服务器端发送请求，需要根据实际情况进行重写
   * 默认情况下使用this.ajax属性发送一个get请求，
   * */
  send: function (params) {
    return this.ajax.get(this.url, {params: params});
  },
  setData: function () {
  }, // 需要根据实际情况进行重写
  /**
   * 如果请求响应的时间太短，比如会造成页面loading闪烁，可以设置during参数让请求响应过程的时间不短于during
   * @param p 发送到服务器端的参数
   * @param o 修改ListData对象的属性
   * */
  load: function (p, o) {
    var params, i, dataCollection = this, startTime = new Date().getTime();
    dataCollection.state.data = 1;
    dataCollection.state.result = 0;
    dataCollection.state.complete = 1;
    // 保存每次搜索的参数
    this.params = p;
    Object.assign(dataCollection, o);
    params = Object.assign({
      pageSize: dataCollection.pageSize,
      currPage: dataCollection.currPage < 1 ? 1 : dataCollection.currPage
    }, p);
    /**减缓请求响应时间。比如让所有请求想的响应时间不低于1秒钟
     * 例如，请求过程中显示loading，如果响应速度太快，页面上可能会出现loading一闪而过。这时候适当的增加些响应延时，可以提升用户体验
     * */
    function delay(callback) {
      var t = dataCollection.during - (new Date().getTime() - startTime);
      return t > 0 ? new Promise(function (resolve) {
        setTimeout(function () {
          resolve(callback());
        }, t);
      }) : callback();
    }

    return dataCollection.send(params).then(function (data) {
      return delay(function () {
        dataCollection.state.data = 2;
        return dataCollection.setData && dataCollection.setData(data) || data;
      });
    }).catch(function () {
      return delay(function () {
        dataCollection.state.data = 3;
      });
    }).then(function (list) {
      if (dataCollection.action == "next") {
        list && (list = (dataCollection.data || []).concat(list));
      }
      dataCollection.state.complete = 2;
      dataCollection.data = list || (dataCollection.type == "array" ? [] : {});
      // 有数据返回true，无数据false
      dataCollection.state.result = function (data) {
        if (data) {
          for (var i in data) {
            return true;
          }
        }
        return false;
      }(list);
    });
  },
  /**刷新数据
   * */
  refresh: function () {
    this.currPage = 1;
    this.action = "refresh";
    return this.load(this.params);
  },
  /**加载下一页的数据
   * */
  next: function () {
    if (this.totalPage >= this.currPage + 1) {
      this.currPage++;
      this.action = "next";
      return this.load(this.params);
    }
    return {
      then: function (callback) {
        return {
          catch: function (callback) {
            return (typeof callback == "function") && callback({allLoaded: true});
          }
        }
      }
    };
  },
  /**把数据设置成初始状态
   * */
  clearData: function () {
    var defaults = {
        state: {
          data: 0, // 数据加载状态：0：未开始；1：加载中；2：加载成功；3：加载失败
          complete: 0, // 数据加载状态是否完成。0：初始状态；1：加载中；2：加载完成
          result: 0 // 是否有数据。0：无数据；1：有数据
        },
        type: "array",
        // ajax: null, // 请求数据需要提供一个axios对象   不重置
        // url: null, // 不重置
        during: 0, // 请求响应时间至少during毫秒
        params: null,
        pageSize: 10,
        currPage: 1,
        totalCount: 0,
        totalPage: 0
      },
      dataType = {
        array: [],
        object: {}
      };
    Object.assign(this, defaults, this.initData);
    this.data = dataType[this.type] || [];
  }
};

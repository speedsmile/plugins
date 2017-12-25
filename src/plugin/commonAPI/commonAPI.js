/**
 * Created by weikaiwei on 2017/6/14.
 * 兼容简化浏览器的一些原生API
 */
(function (window, document) {
  /**判断dom元素是否具有指定的选择器，兼容IE9+
   * 基于Element的原型，把api统一成matches
   * */
  +function () {
    var elPro = window.Element.prototype, nodeListPro = window.NodeList.prototype;
    elPro.matches = elPro.matches || elPro.webkitMatchesSelector || elPro.msMatchesSelector || elPro.mozMatchesSelector;
    nodeListPro.forEach = nodeListPro.forEach || Array.prototype.forEach;
  }();
  export default {
    getComputedStyle: function (target, name) {
      var getComputedStyle = window.getComputedStyle, v;
      (typeof target == "string") && (target = document.querySelector(target));
      if (getComputedStyle) {
        v = getComputedStyle(target)[name.replace(/\-([a-zA-Z])/g, function (a, b) {
          return b.toUpperCase();
        })];
      } else if (target.currentStyle) {
        v = target.currentStyle(name);
      }
      return /px/.test(v) ? parseFloat(v) : v;
    },
    addClass: function (el, classNames) {
      var className = el.className, list1 = (className || "").split(" "), list2 = (classNames || "").split(" ");
      for (var i = 0, l = list2.length; i < l; i++) {
        list1.indexOf(list2[i]) == -1 && (list1.push(list2[i]));
      }
      el.className = list1.join(" ");
    },
    removeClass: function (el, classNames) {
      var className = el.className, list1 = (className || "").split(" "), list2 = (classNames || "").split(" ");
      for (var i = 0, l = list2.length; i < l; i++) {
        var index = list1.indexOf(list2[i]);
        index > -1 && (list1.splice(index, 1));
      }
      el.className = list1.join(" ");
    },
    toggleClass: function (el, classNames, b) {
      var className = el.className, list1 = (className || "").split(" "), list2 = (classNames || "").split(" ");
      if (arguments.length > 2) {
        this[b ? "addClass" : "removeClass"](el, classNames);
      } else {
        for (var i = 0, l = list2.length; i < l; i++) {
          var index = list1.indexOf(list2[i]);
          index > -1 ? list1.splice(index, 1) : list1.push(list2[i]);
        }
        el.className = list1.join(" ");
      }
    }
  };
}(window, document))

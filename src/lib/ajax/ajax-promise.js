require("es6-promise").polyfill();
(function ($) {
	var ajax = $.originAjax = $.ajax;
	$.ajaxSettings.dataType = "json";
	$.ajax = function (options) {
		var success = options.success || function () {
			},
			error = options.error || function () {
			};
		return new Promise(function (resolve, reject) {
				options.success = function (res) {
					var dataType = options.dataType || $.ajaxSettings.dataType;
					if (dataType.toLowerCase() == "json" && typeof res === 'string') {
						try {
							res = JSON.parse(res);
						} catch (e) {
							res = {};
						}
					}
					success.apply(this, arguments);
					resolve(res);
				};
				options.error = function () {
					error.apply(this, arguments);
					reject(new Error(arguments));
				};
				ajax.call($, options);
			}
		);
	};
}(window.$ || window.jQuery || window.Zepto));

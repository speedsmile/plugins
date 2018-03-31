# 更新日志

### 0.1.0  (2018-02-22)
* type.js
    isNumber方法检测NaN将返回false
* extend.js
    * 文件名首字母改成小写
    * 之前的版本在拷贝Date对象后，类型变成了Object。使用jQuery.extend的源码，能够正确拷贝复杂类型
* extend.js、Date.js、Number.js
    import、export方式改为commonJS（兼容node.js）
* Date.js
    * 支持多种日期格式化模式
        y、Y、year
        m、M、month
        d、D、date
        h、H、hour
        i、I、minute
        s、S、second
        ms
    * set方法改为setDate方法，设置日期时间
        和toDate方法的区别：当指定的时间是非负数时，直接覆盖对应时间上的时间；toDate方法是在当前基础上累加。
        参数是负数则和toDate方法一样在当前时间上累加
    * 新增setNativeDate方法
        作用同setDate方法。
        setDate方法设置增强日期对象，该方法设置原生日期对象

### 0.1.1  (2018-03-31)
1、移除Date和Number对extend模块的依赖，改为Object.assign方法。

2、修复Date的bug：
   设置年份和月份没有比较舍之前和设置后的日期单位的差异，
   引起3月31日向后偏移一个月变成2月31日，会变成3月2日（闰年情况），或3月3日（平年情况）。
   平年和闰年的偏移同样会导致日期不准。

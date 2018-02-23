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
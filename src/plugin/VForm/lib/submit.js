/**以form表单方式提交的方法。不依赖任何插件
 * @param params Object {key: value} => {"表单参数名称，对应表单元素的name": "参数对应的value"}
 * @param action String 表单提交的路径
 * @param method String 默认get方法
 * @param target Boolean true，指向一个隐藏的iframe，防止表单提交造成页面跳转
 * @param formName String 给表单指定一个name，多次调用此方法，相同name的表单可以直接复用，不用再创建新的
 * @param encode Function(v):any 表单元素的value转义的方法，默认不转义
 * */
export default function ({params, action, method = "get", target = true, formName = "hidden-form", encode = v => v}){
  let form = document.querySelector(`[name=${formName}]`),
    targetName = formName + "-target", iframe = document.querySelector(`[name=${targetName}]`);
  // 指定name的表单不存在则新建一个
  if (!form) {
    form = document.createElement("form");
    form.name = formName;
    form.style.display = "none";
    document.body.appendChild(form);
  }
  // 该form表单如果没有对应的隐藏提交用的iframe，则创建一个
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.name = targetName;
    iframe.style.display = "none";
    document.body.appendChild(iframe);
  }
  let str = "";
  for (let k in params) {
    str += `<input type="hidden" name="${k}" value='${encode(params[k])}'>`;
  }
  form.action = action;
  form.method = method;
  form.innerHTML = str;
  form.target = target ? targetName : "";
  form.submit();
}

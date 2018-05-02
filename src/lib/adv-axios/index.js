import "./loading/style.less";
import Loading from "./loading";
let axios = require("axios");
function request_then(config){
  config.params || (config.params = {});
  let {loading} = config;
  if(loading){
    // 发送请求前加上loading
    config.loadingId = Loading.open();
  }
  // 给所有的请求加上token，后端接口没有token报500错误。undefined的参数不会被发送
  config.params.token = localStorage.getItem("t") || "";
  return config;
}
function response_then(response){
  // 请求完成去掉对应的loading
  response.config.loadingId && Loading.close(response.config.loadingId);
}
function response_error(data){
  let {config} = data;
  // 请求完成去掉对应的loading
  config.loadingId && Loading.close(config.loadingId);
  return Promise.reject(data);
}
function addDefauls(axios){
  // 添加请求拦截器
  axios.interceptors.request.use(request_then, error => error);
  // 添加响应拦截器
  axios.interceptors.response.use(response_then, response_error);
  return axios;
}
addDefauls(axios);
let _create = axios.create;
axios.create = (...args) => addDefauls(_create.apply(axios, args));
export default axios;

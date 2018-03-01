let axios = require("axios");
function response_then(response){
  if(response.data){
    return response.data;
  }else return response;
}
function response_error(error){
  return Promise.reject(error);
}
function addDefauls(axios){
  // 添加请求拦截器
  axios.interceptors.request.use(config => config, error => error);
  // 添加响应拦截器
  axios.interceptors.response.use(response_then, response_error);
  return axios;
}
addDefauls(axios);
let _create = axios.create;
axios.create = (...args) => addDefauls(_create.apply(axios, args));
module.exports = axios;

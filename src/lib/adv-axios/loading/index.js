/**
 * Created by weikaiwei on 2018/4/9.
 */
const CT_CLASS = "loading-containers";
// 定义自增序列和当前的loading数量
export default {
  sequence: 1,
  _nums: 0,
  get nums(){ return this._nums},
  set nums(v){
    this._nums = v;
    this.el && (this.el.style.display = v == 0 ? "none" : "");
  },
  el: null,
  _create_(id){
    if(!this.el){
      this.el = document.createElement("div");
      this.el.className = CT_CLASS;
      let nLoading = document.createElement("div");
      nLoading.className = "loading";
      nLoading.innerHTML = `
                <div class="loading-stars">
                    <svg class="loader-star" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
                        <polygon points="29.8 0.3 22.8 21.8 0 21.8 18.5 35.2 11.5 56.7 29.8 43.4 48.2 56.7 41.2 35.1 59.6 21.8 36.8 21.8 "></polygon>
                    </svg>
                    <div class="loader-circles"></div>
                </div>
    `;
      this.el.appendChild(nLoading);
      document.body.appendChild(this.el);
    }
    return id;
  },
  open(){
    this.nums++;
    return this._create_(++this.sequence);
  },
  close(id){
    id && this.nums--;
  }
};
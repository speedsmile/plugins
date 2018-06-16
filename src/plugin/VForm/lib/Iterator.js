export default function Iterator(arr){
  this.i = 0;
  this.arr = arr;
  this.hasNext = function(){
    return this.arr && this.arr.length > this.i;
  };
  this.next = function(){
    return this.arr[this.i++];
  };
  this.loop = function(){
    
    return this;
  };
  this.end = function(){
    return this.arr[this.i++];
  };
}

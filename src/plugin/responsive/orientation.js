/**不同浏览器横竖屏
 * Created by weikaiwei on 2017/12/18.
 */
/**
 * window.orientation： 0或180表述竖屏，-90或90表示横屏
 * */
function getOrientation(){

  // : “portrait-primary”默认 是竖屏, “portrait-secondary”默认的基础上旋转90度,
  //“landscape-primary”和 “landscape-secondary”
//            锁住屏幕方向
  var orientation = window.screen.orientation;
//            orientation.lock("landscape-primary");
//            window.screen.lockOrientation = screen.lockOrientation ||screen.mozLockOrientation || screen.msLockOrientation;
//            window.screen.unlockOrientation = screen.unlockOrientation|| screen.mozUnLockOrientation || screen.msUnLockOrientation;


  return 0;
}

// 3.flyto
import {
  wgs2gcj,
  gcj2wgs
} from "./WGS84_to_GCJ02.js"

const initPosition = [115.827729, 28.649887]
console.log(gcj2wgs(initPosition));
var init_position = gcj2wgs(initPosition)
// 115.82766387166342, 28.64998470811954
// 115.82779412833659, 28.64978929188046
// 115.8193748874706,28.65117631141956
// 115.8236046882246, 28.654284820595084
//(WGSLat(initPosition[0], initPosition[1])), (WGSLon(initPosition[0], initPosition[1]))
camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(init_position[0], init_position[1], 3500),
  orientation: {
    heading: Cesium.Math.toRadians(0.0), // 方向
    pitch: Cesium.Math.toRadians(-90.0), // 倾斜角度
    roll: 0,
  },
  duration: 4, // 设置飞行持续时间，默认会根据距离来计算
  complete: function () {
    //    到达位置后执行的回调函数
  },
  cancel: function () {
    //    如果取消飞行则会调用此函数
  },
  pitchAdjustHeight: -90, // 如果摄像机飞越高于该值，则调整俯仰俯仰的俯仰角度，并将地球保持在视口中。
  maximumHeight: 7000, // 相机最大飞行高度
  flyOverLongitude: 100, // 如果到达目的地有2种方式，设置具体值后会强制选择方向飞过这个经度(这个，很好用)
});
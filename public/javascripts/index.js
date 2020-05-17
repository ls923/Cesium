// 使用Token
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMzNjNTE2YS01NDE1LTQ1YTYtYWUxNS1kNjgxNjA5ZWM4NWQiLCJpZCI6MTg3OTQsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzQ0MDQzNTV9.YiUZ24VGSLGV3uwK2gsSvBgZy7dDRLvLcaOKD4bnbWM";

//初始化
var viewer = new Cesium.Viewer("cesiumContainer", {
  shouldAnimate: true,
  animation: false, //动画小器件，左下角仪表
  geocoder: false, //geocoder小器件，右上角查询按钮
  fullscreenButton: false, //全屏按钮
  homeButton: false, //是Home按钮
  infoBox: true, //信息框
  sceneModePicker: false, //3D/2D选择器
  selectionIndicator: true, //选取指示器组件
  timeline: false, //时间轴
  navigationHelpButton: false, //右上角的帮助按钮
  scene3DOnly: true, //如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
  vrButton: false,
  // terrainProvider : Cesium.createWorldTerrain(),
  orderIndependentTranslucency: false, //cesium背景设置为透明
  // 使用Bingmap地图服务
  imageryProvider: new Cesium.BingMapsImageryProvider({
    url: "https://dev.virtualearth.net",
    key: "Ao45qZAyTXIGLedEWI4Qi0INAz5MxAWwzKyAvbgL7BeJ_pb63oAJMaqECYADZVfC",
    mapStyle: Cesium.BingMapsStyle.AERIAL_WITH_LABELS,
  }),
  baseLayerPicker: false,
});

var scene = viewer.scene;
var canvas = viewer.canvas;
var clock = viewer.clock;
var camera = viewer.scene.camera;
var entities = viewer.entities;
var pinBuilder = new Cesium.PinBuilder();
// 加载gltf格式数据到cesium
// viewer.extend(Cesium.viewerCesiumInspectorMixin);
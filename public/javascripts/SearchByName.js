import {
  wgs2gcj,
  gcj2wgs
} from "./WGS84_to_GCJ02.js"

layui.use(['layer', 'table', 'element'], function () {
  var element = layui.element; // 导航的hover效果、二级菜单等功能，需要依赖element模块
  var layer = layui.layer
})
var temp_data;
$(".search_list").on('mouseleave', () => {
  // $('#search_input').val('');
  $('#search_list').empty('');
});

$(".search_btn").on('click', function () {
  $('#search_list').html('');
  var content = $("#search_input").val();
  var data = {
    keywords: content,
    city: '南昌',
    citylimit: true,
    location: "115.827729,28.649887",
    key: '53e857a31b7e40e2b85d45659778b73e'
  }
  $.get('https://restapi.amap.com/v3/assistant/inputtips?', data, function (res, status) {
    console.log(res)
    temp_data = res.tips;
    var str = '';
    for (var i = 0; i < res.count; i++) {
      str += '<li><a class="to_positions" id="' + i + '">' + res.tips[i].name + '</a></li>';
    }
    $('#search_list').html(str);
  })

})
$("#search_list").on('click', ".to_positions", function () {
  var index = $(this).attr('id');
  var positions = temp_data[index].location.split(",");
  console.log(positions)
  var finarray = gcj2wgs(positions)
  console.log(finarray);
  camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(finarray[0], finarray[1], 300),
    orientation: {
      heading: Cesium.Math.toRadians(0.0), // 方向
      pitch: Cesium.Math.toRadians(-90.0), // 倾斜角度
      roll: 0,
    },
    duration: 4, // 设置飞行持续时间，默认会根据距离来计算
  })
  var hospitalPin = Cesium.when(
    pinBuilder.fromUrl("../images/point.png", Cesium.Color.BLACK.withAlpha(0.5), 48),
    function (canvas) {
      return viewer.entities.add({
        name: temp_data[index].name,
        position: Cesium.Cartesian3.fromDegrees(finarray[0], finarray[1]),
        billboard: {
          image: canvas.toDataURL(),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
      });
    }
  );
});



$('.search_input').keyup(function () {
  // layer.tips(str, '#search_input');
  $('#search_list').html('');
  var content = $("#search_input").val();
  var data = {
    keywords: content,
    city: '南昌',
    citylimit: true,
    location: "115.827729,28.649887",
    key: '53e857a31b7e40e2b85d45659778b73e'
  }
  $.get('https://restapi.amap.com/v3/assistant/inputtips?', data, function (res, status) {
    console.log(res)
    temp_data = res.tips;
    var str = '';
    for (var i = 0; i < res.count; i++) {
      str += '<li><a class="to_positions" id="' + i + '">' + res.tips[i].name + '</a></li>';
    }
    $('#search_list').html(str);
  })
});
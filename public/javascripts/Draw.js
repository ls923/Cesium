// 屏蔽双击左键事件
viewer.scene.globe.depthTestAgainstTerrain = false
viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
  Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
)
viewer.scene.postProcessStages.fxaa.enabled = false
// 现有 点 的集合
var activeShapePoints = []
var paramsJson
var array;
var param = []
var LineId = 0
var GonId = 0
var shape_type
var shape_id
var shape_name
var pick = null
var pickEntity
var pickEntity_position = []
var activeShape
var newPosition
var floatingPoint
var drawingMode = 'none'
var distance = 0
var cartesian = null
var handler = null
var radiansPerDegree = Math.PI / 180.0; // 角度转化为弧度(rad)
var degreesPerRadian = 180.0 / Math.PI; // 弧度转化为角度

// 创建点
function createPoint(worldPosition) {
  var point = viewer.entities.add({
    position: worldPosition,
    point: {
      name: 'points',
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      pixelSize: 10,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      //    表示相对于地形的位置。 该位置固定在地形上。
    }
  })
  return point
}

// 根据传参和drawingMode创建图形
function drawShape(positionData) {
  var shape
  if (drawingMode === 'line') {
    shape = viewer.entities.add({
      name: 'polyline' + LineId,
      polyline: {
        positions: positionData,
        clampToGround: true,
        width: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
  } else if (drawingMode === 'polygon') {
    shape = viewer.entities.add({
      name: 'polygon' + GonId,
      polygon: {
        hierarchy: positionData,
        material: new Cesium.ColorMaterialProperty(
          Cesium.Color.WHITE.withAlpha(0.7)
        ),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
  }
  return shape
}

// 初始化各项参数
function terminateShape() {
  activeShapePoints.pop()
  drawShape(activeShapePoints)
  viewer.entities.remove(floatingPoint)
  viewer.entities.remove(activeShape)
  floatingPoint = undefined
  activeShape = undefined
  activeShapePoints = []
  distance = 0
  cartesian = null
}

// 计算activeShapePoints每两点累加距离
function getSpaceDistance(activeShapePoints) {
  var distance = 0
  for (var i = 0; i < activeShapePoints.length - 1; i++) {
    // 从笛卡尔位置创建一个新的制图实例。返回一个制图表达结果，对象将以弧度表示。
    var point1cartographic = Cesium.Cartographic.fromCartesian(
      activeShapePoints[i]
    )
    var point2cartographic = Cesium.Cartographic.fromCartesian(
      activeShapePoints[i + 1]
    )

    //  根据经纬度计算出距离
    var geodesic = new Cesium.EllipsoidGeodesic()
    // 设置待测线的起点和终点
    geodesic.setEndPoints(point1cartographic, point2cartographic)
    // 返回两点之间的距离
    var s = geodesic.surfaceDistance
    // 返回两点之间的距离
    s = Math.sqrt(
      Math.pow(s, 2) +
      Math.pow(point2cartographic.height - point1cartographic.height, 2)
    )
    distance = distance + s
  }
  return distance.toFixed(2)
}

// 计算两点距离
function getDistance(point1, point2) {
  // 从笛卡尔位置创建一个新的制图实例。返回一个制图表达结果，对象将以弧度表示。
  var point1cartographic = Cesium.Cartographic.fromCartesian(point1)
  var point2cartographic = Cesium.Cartographic.fromCartesian(point2)
  //  根据经纬度计算出距离
  var geodesic = new Cesium.EllipsoidGeodesic()
  // 设置待测线的起点和终点
  geodesic.setEndPoints(point1cartographic, point2cartographic)
  // 返回两点之间的距离
  var s = geodesic.surfaceDistance
  // 计算 距离 和 高度 的
  s = Math.sqrt(
    Math.pow(s, 2) +
    Math.pow(point2cartographic.height - point1cartographic.height, 2)
  )
  console.log('getDistance:' + s)
  return s
}

// 计算多边形面积
function getArea(points) {
  var res = 0
  // 拆分三角曲面
  for (var i = 0; i < points.length - 2; i++) {
    var j = (i + 1) % points.length
    var k = (i + 2) % points.length
    var totalAngle = Angle(points[i], points[j], points[k])
    // console.log(activeShapePoints[i])
    // console.log(activeShapePoints[j])
    // console.log(activeShapePoints[k])
    var dis_temp1 = getDistance(activeShapePoints[i], activeShapePoints[j])
    var dis_temp2 = getDistance(activeShapePoints[j], activeShapePoints[k])
    res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle))
    console.log('getArea:' + res)
  }
  return (res / 1000000.0).toFixed(4)
}

/*角度*/
function Angle(p1, p2, p3) {
  var bearing21 = Bearing(p2, p1)
  var bearing23 = Bearing(p2, p3)
  var angle = bearing21 - bearing23
  if (angle < 0) {
    angle += 360
  }
  return angle
}

/*方向*/
function Bearing(from, to) {
  var lat1 = from.lat * radiansPerDegree
  var lon1 = from.lon * radiansPerDegree
  var lat2 = to.lat * radiansPerDegree
  var lon2 = to.lon * radiansPerDegree
  var angle = -Math.atan2(
    Math.sin(lon1 - lon2) * Math.cos(lat2),
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
  )
  if (angle < 0) {
    angle += Math.PI * 2.0
  }
  angle = angle * degreesPerRadian; // 角度

  return angle
}


// 画线
$(function () {
  $('.line>a').click(function () {
    layer.msg('鼠标左键划线，右键结束作图！', {
      anim: 0
    }, function () {
      layer.alert('Drawing Line', {
        area: ['100px'],
        shade: 0,
        title: 'Mode',
        btn: [],
        anim: 2,
        offset: 'rb',
      });
    });

    var entity = viewer.entities.add({
      label: {
        show: false,
        showBackground: true,
        font: '14px monospace',
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        pixelOffset: new Cesium.Cartesian2(15, 0),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
    console.log("handler before:");
    console.log(handler);
    if (handler) {
      handler.destroy();
      handler = null;
      console.log("handler destroy:");
      console.log(handler);
    }

    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    // 第一次 -按下鼠标左键
    handler.setInputAction(function (event) {
      // 通过 camera.getPickRay 将当前的屏幕坐标转化为 ray(射线)
      var ray = viewer.camera.getPickRay(event.position)
      // 找出 ray 和 地形的交点 ，得出三维世界坐标
      var earthPosition = viewer.scene.globe.pick(ray, viewer.scene)

      console.log('ray 坐标:')
      console.log(ray)
      // 获取屏幕二维坐标
      pick = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        scene,
        earthPosition
      )
      console.log('pick 屏幕二维坐标:')
      console.log(pick)

      if (Cesium.defined(earthPosition)) {
        // 判断当前是否为第一个点
        if (activeShapePoints.length === 0) {
          // 创建 点
          floatingPoint = createPoint(earthPosition)
          // 将当前坐标保存至 activeShapePoints
          activeShapePoints.push(earthPosition)
          console.log(
            'activeShapePoints First Push (第一个点) :' + activeShapePoints
          )
          // 由回调函数延迟计算当前所有 点 的属性
          var dynamicPositions = new Cesium.CallbackProperty(function () {
            if (drawingMode === 'polygon') {
              // drawingMode = 面 返回一个由 该点 定义的多边形及其孔的线性环的层次结构。
              return new Cesium.PolygonHierarchy(activeShapePoints)
            }
            // drawingMode = 线 直接返回返回
            return activeShapePoints
          }, false)
          // 根据 activeShapePoints 里的坐标 画图
          activeShape = drawShape(dynamicPositions)
        }
        // 不是第一个点，直接存入 activeShapePoints
        activeShapePoints.push(earthPosition)
        console.log(
          'activeShapePoints Next Push (第二个点) :' + activeShapePoints
        )
        createPoint(earthPosition)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 鼠标移动
    handler.setInputAction(function (event) {
      // 如果 定义了 floaingPoint ->（已经有点参数保存）
      if (Cesium.defined(floatingPoint)) {
        // 通过 camera.getPickRay 将当前的屏幕坐标转化为 ray(射线)
        var ray = viewer.camera.getPickRay(event.endPosition)
        // 找出 ray 和 地形的交点 ，得出三维世界坐标
        var newPosition = viewer.scene.globe.pick(ray, viewer.scene)
        if (Cesium.defined(newPosition)) {
          // 把 新获取的 坐标
          floatingPoint.position.setValue(newPosition)
          //  每新加入一个点就弹出原数组的点，再把新的点添加进去
          activeShapePoints.pop()
          // console.log("activeShapePoints Move pop:"+activeShapePoints)
          activeShapePoints.push(newPosition)
          // console.log("activeShapePoints Move Push:"+activeShapePoints)
          // 计算两点距离
          distance = getSpaceDistance(activeShapePoints)
          entity.position = newPosition
          entity.label.show = true
          entity.label.text = '现在共' + distance + '米'
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 点击鼠标右键 终止画图
    handler.setInputAction(function (event) {
      LineId = LineId + 1
      // console.log(LineId)
      // 初始化各项值
      console.log()
      handler.destroy()
      console.log('Line handler')
      if (handler.isDestroyed()) {
        console.log(handler.isDestroyed(), 'handler has destroy')
      } else {
        console.log(handler.isDestroyed(), 'handler has no destroy')
      }

      terminateShape()
      console.log('Stop Drawing')
      layer.msg('POLYLINE:已经结束作图！', {
          time: 1000,
        },
        function () {
          layer.closeAll();
        });
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    //
    drawingMode = 'line'
  })
})
// 画多边形
$(function () {
  $('.poly>a').click(function () {
    layer.msg('鼠标左键划面，右键结束作图！', {
      time: 3000,
      anim: 0
    }, function () {
      layer.alert('Drawing Polygon', {
        area: ['100px'],
        shade: 0,
        title: 'Mode',
        btn: [],
        anim: 2,
        offset: 'rb',
      });
    });
    if (handler) {
      handler.destroy();
      handler = null;
      console.log("handler destroy:");
      console.log(handler);
    }
    var ploygonarea = 0
    var tempPoints = []
    var entity = viewer.entities.add({
      label: {
        show: false,
        showBackground: true,
        font: '14px monospace',
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        pixelOffset: new Cesium.Cartesian2(15, 0),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    // 第一次 -按下鼠标左键
    handler.setInputAction(function (event) {
      // 通过 camera.getPickRay 将当前的屏幕坐标转化为 ray(射线)
      var ray = viewer.camera.getPickRay(event.position)
      // 找出 ray 和 地形的交点 ，得出三维世界坐标
      var earthPosition = viewer.scene.globe.pick(ray, viewer.scene)

      console.log('ray 坐标:')
      console.log(ray)
      // 获取屏幕二维坐标
      pick = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        scene,
        earthPosition
      )
      console.log('pick:')
      console.log(pick)

      console.log('Polygon Pick Position:' + earthPosition)
      // var earthPosition = viewer.scene.pickPosition(event.position)
      if (Cesium.defined(earthPosition)) {
        if (activeShapePoints.length === 0) {
          floatingPoint = createPoint(earthPosition)
          activeShapePoints.push(earthPosition)
          console.log('Polygon activeShapePoints Push:' + activeShapePoints)

          var dynamicPositions = new Cesium.CallbackProperty(function () {
            if (drawingMode === 'polygon') {
              return new Cesium.PolygonHierarchy(activeShapePoints)
            }
            return activeShapePoints
          }, false)
          activeShape = drawShape(dynamicPositions)
        }
        activeShapePoints.push(earthPosition)
        console.log('Polygon activeShapePoints Push:' + activeShapePoints)
        createPoint(earthPosition)
        // 从笛卡尔位置创建一个新的制图实例。中的值结果对象将以弧度表示。
        var cartographic = Cesium.Cartographic.fromCartesian(earthPosition)
        // 将经度转换为度。
        var longitudeString = Cesium.Math.toDegrees(cartographic.longitude)
        // 将纬度转换为度。
        var latitudeString = Cesium.Math.toDegrees(cartographic.latitude)
        // 椭球上方的高度（以米为单位）
        var heightString = cartographic.height

        // 将这组数据添加到 tempPoints
        tempPoints.push({
          lon: longitudeString,
          lat: latitudeString,
          hei: heightString
        })
        console.log('TempPoints Push:')
        console.log(tempPoints)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 鼠标移动
    handler.setInputAction(function (event) {
      // 如果 定义了 floaingPoint ->（已经有点参数保存）
      if (Cesium.defined(floatingPoint)) {
        // 通过 camera.getPickRay 将当前的屏幕坐标转化为 ray(射线)
        var ray = viewer.camera.getPickRay(event.endPosition)
        // 找出 ray 和 地形的交点 ，得出三维世界坐标
        newPosition = viewer.scene.globe.pick(ray, viewer.scene)
        // var newPosition = viewer.scene.pickPosition(event.endPosition)
        if (Cesium.defined(newPosition)) {
          floatingPoint.position.setValue(newPosition)
          //  每新加入一个点就弹出原数组的点，再把新的点添加进去
          activeShapePoints.pop()
          activeShapePoints.push(newPosition)
          // 设置 面积 label
          ploygonarea = getArea(tempPoints)
          entity.position = newPosition
          entity.label.show = true
          entity.label.text = '现在共' + ploygonarea + '平方千米'
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 点击鼠标右键 终止画图
    handler.setInputAction(function () {
      GonId = GonId + 1
      // 设置 面积 label
      ploygonarea = getArea(tempPoints)
      entity.label.show = true
      entity.label.text = '现在共' + ploygonarea + '平方千米'
      // 初始化各项 参数
      handler.destroy()
      terminateShape()
      console.log('Polygon handler')
      if (handler.isDestroyed()) {
        console.log(handler.isDestroyed(), 'handler has destroy')
      } else {
        console.log(handler.isDestroyed(), 'handler has no destroy')
      }
      layer.msg('POLYGON:已经结束作图！', {
          time: 1000,
        },
        function () {
          layer.closeAll();
        });
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    drawingMode = 'polygon'
  })
})



// add
$(".add").click(function () {
  $("#add_Shape").toggleClass('layui-hide');
  add_form();
});
// addAjax
function addAjax(data) {
  $.ajax({
    type: 'post',
    url: 'add_shape/new', // 一样接口路径
    data: data,
    success: function (text) {
      console.log(text)
      if (text == "error") {
        layer.msg('失败啦！', {
          icon: 2,
          time: 2000,
          anim: 1,
          offset: 't'
        });
      } else {
        layer.msg('添加成功！', {
          icon: 1,
          time: 2000,
          anim: 1,
          offset: 't'
        });
      }
    },
    error: function (text) {
      console.log(text)
      layer.msg('失败啦！', {
        icon: 2,
        time: 2000,
        anim: 1,
        offset: 't'
      });

    }
  })
}
// addForm
function add_form(data1) {

  layui.use(['layer', 'form'], function () {
    var layer = layui.layer;
    layer.open({
      type: 1,
      title: 'Shape_Add',
      area: ['500px', '400px'],
      content: $('#add_Shape'),
      shadeClose: true,
      offset: "",
      shade: 0,
      skin: 'layui-layer-lan',
      success: function () {
        var form = layui.form;
        if (data1) {
          form.val("save_form", { //formTest 即 class="layui-form" 所在元素属性 lay-filter="" 对应的值
            "id": data1.id, // "name": "value"
            "name": data1.name,
          });
        }
        form.on('submit(save_btn)', function (data) {
          // console.log(data.elem) //被执行事件的元素DOM对象，一般为button对象
          // console.log(data.form) //被执行提交的form对象，一般在存在form标签时才会返回
          console.log(data.field) //当前容器的全部表单字段，名值对形式：{name: value}

          addAjax(data.field);

          return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
        });
      },
      end: function () {
        // $("[lay-id = 'table-model']").remove()
        $("#add_Shape").addClass('layui-hide');
      }
    });
  })
}


// read polyline
$(function () {
  $('.test').click(function () {
    viewer.entities.add({
      name: 'Red line on terrain',
      polyline: {
        id: 'line1',
        name: '11111',
        positions: array,
        width: 5,
        material: Cesium.Color.RED,
        clampToGround: true,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
    console.log(param)
    layer.msg('read polyline complete!', {
      time: 3000,
      anim: 3,
    });
  })
})

// read polygon
$(function () {
  $('.test2').click(function () {
    viewer.entities.add({
      name: 'Red polygon on terrain',
      polygon: {
        hierarchy: array,
        material: new Cesium.ColorMaterialProperty(
          Cesium.Color.WHITE.withAlpha(0.7)
        ),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
    layer.msg('read polygon complete!', {
      time: 3000,
      anim: 3,
    });
  })
})


// getPosition
function getPosition(pickEntity) {
  var str = pickEntity.name
  var l = str.match(/polyline/g)
  var g = str.match(/polygon/g)
  if (l) {
    pickEntity_position = pickEntity.polyline.positions
    shape_type = 'polyline'
    console.log('pickEntity_position_LINE:')
    console.log(pickEntity_position)
    // 得到 position 数组
    param = pickEntity_position.valueOf('_value')
    // 数组转化为JSON字符串
    paramsJson = JSON.stringify(param)
    console.log('param')
    console.log(param)
    console.log('paramsJson')
    console.log(paramsJson)
    array = JSON.parse(paramsJson)
    console.log('array')
    console.log(array)
    return paramsJson
  } else if (g) {
    pickEntity_position = pickEntity.polygon.hierarchy
    shape_type = 'polygon'
    param = pickEntity_position.valueOf('_value')
    paramsJson = JSON.stringify(param)
    array = JSON.parse(paramsJson)
    console.log('pickEntity_position_GON:')
    console.log(paramsJson)
    return paramsJson

  }
}
// pickAjax
function pickAjax(position) {
  console.log(position)
  $.ajax({
    type: 'post',
    url: 'add_shape/post_positions', // 一样接口路径
    data: {
      p: position
    },
    success: function (text) {
      console.log(text)
      if (text == "error") {
        layer.msg('失败啦！', {
          icon: 2,
          time: 2000,
          anim: 1,
          offset: 't'
        });
      } else {

        layer.msg('添加成功！', {
          icon: 1,
          time: 2000,
          anim: 1,
          offset: 't'
        });
      }
    },
    error: function (text) {
      console.log(text)

      layer.msg('失败啦！', {
        icon: 2,
        time: 2000,
        anim: 1,
        offset: 't'
      });

    }
  })
}
// pickForm
function pick_positions(shape_id, shape_name, pickEntity) {
  layui.use(['layer', 'form'], function () {
    var layer = layui.layer;
    layer.open({
      type: 1,
      title: 'Pick',
      area: ['400px', '250px'],
      content: $('#pick_position'),
      shadeClose: true,
      offset: "",
      shade: 0,
      skin: 'layui-layer-lan',
      success: function () {
        var form = layui.form;
        console.log(shape_id, shape_name, )
        form.val("position_form", { //formTest 即 class="layui-form" 所在元素属性 lay-filter="" 对应的值
          "id": shape_id, // "name": "value"
          "name": shape_name,
        });
        var data1 = form.val("position_form");
        console.log(data1);

        form.on('submit(save_position_btn)', function (data) {
          console.log(data.field) //当前容器的全部表单字段，名值对形式：{name: value}
          var temp_position = getPosition(pickEntity);
          pickAjax(temp_position)
          layer.closeAll();
          $("#add_Shape").toggleClass('layui-hide');
          add_form(data1);

          return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
        });
      },
      end: function () {
        // $("[lay-id = 'table-model']").remove()
        $("#pick_position").addClass('layui-hide');
      }
    });
  })
}
// pick
$(function () {
  $('.pick>a').click(function () {
    layer.msg('鼠标左键选择，右键取消！', {
      anim: 0
    }, function () {
      layer.alert('Pick', {
        area: ['100px'],
        shade: 0,
        title: 'Mode',
        btn: [],
        anim: 2,
        offset: 'rb',
      });
    });
    if (handler) {
      handler.destroy();
      handler = null;
      console.log("handler destroy:");
      console.log(handler);
    }
    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    handler.setInputAction(function (event) {
      // 选取当前位置 Entity
      // 通过 camera.getPickRay 将当前的屏幕坐标转化为 ray(射线)
      var ray = viewer.camera.getPickRay(event.position)
      // 找出 ray 和 地形的交点 ，得出三维世界坐标
      var earthPosition = viewer.scene.globe.pick(ray, viewer.scene)
      // 获取屏幕二维坐标
      pick = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        scene,
        earthPosition
      )
      var shape_pick = viewer.scene.pick(event.position)
      var pickEntity = Cesium.defined(shape_pick) ? shape_pick.id : null
      if (pickEntity) {
        $("#pick_position").toggleClass('layui-hide');
        shape_id = pickEntity.id
        shape_name = pickEntity.name
        pick_positions(shape_id, shape_name, pickEntity);
        console.log(pickEntity)
      } else {
        layer.msg('没有选中Entity！', {
          time: 1000,
          anim: 6,
          offset: 't'
        });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    handler.setInputAction(function () {
      layer.msg('已结束选择！', {
          time: 1000,
        },
        function () {
          layer.closeAll();
        });

      // 初始化各项值
      handler.destroy()
      console.log('Pick handler')
      if (handler.isDestroyed()) {
        console.log(handler.isDestroyed(), 'handler has destroy')
      } else {
        console.log(handler.isDestroyed(), 'handler has no destroy')
      }

    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  })
})


//  delshaoe
function delShape() {
  viewer.entities.removeAll()
  console.log('has removeall')
  terminateShape()
  layer.msg('已清空！', {
    icon: 1,
    offset: 't',
    time: 3000,
    anim: 1,
  });
  console.log('terminateShape()')
}

// clean
$(function () {
  $('.clean>a').click(function () {

    // $(".tooltips-shape").fadeToggle()
    layer.open({
      content: '是否删除',
      btn: ['yes', 'no'],
      yes: function (index, layero) {
        delShape()
        layer.close(index)
      }
    })
  })
})
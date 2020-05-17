$(function () {
  $('.model_a').click(function () {
    searchAll_model()
  })
})

var collection = viewer.scene.primitives
var temp_mat;
var model_setting;
var isDrawed = false;
// model 沿X轴 旋转
function rotatex(value, model, temp_mat) {

  let m1 = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(value));
  let m = temp_mat
  model.modelMatrix = Cesium.Matrix4.multiplyByMatrix3(m, m1, new Cesium.Matrix4());
}

// model 沿Y轴 旋转
function rotatey(value, model, temp_mat) {
  let m1 = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(value));
  let m = temp_mat
  model.modelMatrix = Cesium.Matrix4.multiplyByMatrix3(m, m1, new Cesium.Matrix4());
}

// model 沿Z轴 旋转
function rotatez(value, model, temp_mat) {

  let m1 = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(value));
  let m = temp_mat
  model.modelMatrix = Cesium.Matrix4.multiplyByMatrix3(m, m1, new Cesium.Matrix4());
}

// 选择 new position
function pickNewPosition(model_id) {
  var model;
  for (let i = 1; i < collection.length; ++i) {
    var p = collection.get(i)
    if (p.id._id == model_id) {
      model = p;
    }
  }
  layer.msg('鼠标左键选择Position，右键结束！', {
    anim: 0
  });

  if (handler) {
    handler.destroy();
    handler = null;
    console.log("handler destroy:");
    console.log(handler);
  }
  handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
  handler.setInputAction(function (event) {
    console.log("start click hander")
    var ray = viewer.camera.getPickRay(event.position)
    var position = viewer.scene.globe.pick(ray, viewer.scene);
    console.log("position", position);
    var mat = Cesium.Transforms.eastNorthUpToFixedFrame(
      position
    )
    if (Cesium.defined(model)) {
      model.modelMatrix = mat;
      temp_mat = mat;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  // MOUSE_MOVE
  handler.setInputAction(function (event) {
    layer.msg('已结束选择！', {
      time: 1000,
    });
    handler.destroy()
    console.log('Model position handler')

  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
}
//  update Matrix
function updateMatrix(model_matrix, id) {
  $.ajax({
    type: 'get',
    url: '/model/UpdataPosition',
    data: {
      position: JSON.stringify(model_matrix),
      model_id: id
    },
    success: function (result) {
      layer.alert('修改Position成功！', {
        icon: 1,
        time: 2000,

      }, function (index) {
        //do something
        layer.close(index);
      });


    }
  })
}

// 通过 id 获得当前 model 属性
function searchModelFromId(id) {
  var items;
  $.ajax({
    type: 'get',
    url: '/model/searchFrom_model_id',
    data: {
      model_id: id
    },
    success: function (result) {

      items = JSON.parse(result)
      items = items[0]

      // console.log(items);
      var item
      var positions = JSON.parse(items.model_position)
      if (Object.keys(positions)[0] == 'position') {
        // console.log(positions);
        item = {
          id: items.model_id,
          name: items.model_name,
          position: [positions.position[0], positions.position[1]],
          url: items.model_url
        }

        drawModelByPosition(item)
      } else if (Object.keys(positions)[0] == 'matrix') {
        // console.log(positions);
        item = {
          id: items.model_id,
          name: items.model_name,
          position: positions.matrix,
          url: items.model_url
        }

        drawModelByMatrix(item)
      }

    }
  })
}

// 展示 / 隐藏
function UpdateisShow(id, val) {
  $.getJSON(
    '/model/UpdateIsShow', {
      model_id: id,
      isShow: val
    },
    function (result) {
      console.log('Update Json:  isShow:', val)
    }
  )
}

// position draw model 添加到地图上
function drawModelByPosition(item) {
  var mat = Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(item.position[0], item.position[1], 0)
  )
  if (item.id.match(/jxl_c/g)) {
    var rotationX = Cesium.Matrix4.fromRotationTranslation(
      Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(0))
    )
  } else if (item.id.match(/jxl/g)) {
    var rotationX = Cesium.Matrix4.fromRotationTranslation(
      Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(-180))
    )
  } else if (item.id.match(/ss/g)) {
    var rotationX = Cesium.Matrix4.fromRotationTranslation(
      Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(90))
    )
  }

  Cesium.Matrix4.multiply(mat, rotationX, mat)
  var model = collection.add(
    Cesium.Model.fromGltf({
      id: {
        _id: item.id,
        _name: item.name
      },
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      allowPicking: true,
      url: item.url, // 如果为bgltf则为.bgltf
      modelMatrix: mat,
      scale: 1.0, // 放大倍数
    })
  )
}
// matrix draw model 
function drawModelByMatrix(item) {
  var mat = Cesium.Matrix4.fromArray(item.position)
  var Option = Cesium.Model.fromGltf({
    id: {
      _id: item.id,
      _name: item.name
    },
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    allowPicking: true,
    url: item.url, // 如果为bgltf则为.bgltf
    modelMatrix: mat,
    scale: 1.0, // 放大倍数
  })
  var model = collection.add(Option)
}


function drawShowModel() {
  $.ajax({
    type: 'get',
    url: '/model/QueryAllShow',
    success: function (result) {
      var temp_model_id;
      for (let i = 0; i < result.length; i++) {
        if (!isDrawed) {

          temp_model_id = result[i].model_id
          searchModelFromId(temp_model_id)
        } else {
          for (let j = 1; j < collection.length; j++) {
            var p = collection.get(j)
            if (p.id._id == temp_model_id) {
              console.log("p", p)
            }
          }
        }
      }
      console.log("collection", collection);
      isDrawed = true;
      layer.msg('已展示所有 状态为 Show 的 Model', {
        icon: 1,
        time: 3000,
        anim: 1,
        offset: 't'
      });

    }
  })
}

// opensetting
function Opensetting(data, model) {
  layui.use(['layer', 'slider'], function () {
    var layer = layui.layer
    var slider = layui.slider
    for (let i = 1; i < collection.length; ++i) {
      var p = collection.get(i)
      if (p.id._id == data.model_id) {
        model = p;
      }
    }
    temp_mat = model.modelMatrix;
    var reset_mat = model.modelMatrix;
    var roateX = slider.render({
      elem: '#slideTest',
      max: 360,
      input: true, //输入框,
      change: function (value) {
        rotatex(value, model, temp_mat)

      }
    });
    var roateY = slider.render({
      elem: '#slideTest2',
      max: 360,
      input: true, //输入框
      theme: '#5FB878',
      change: function (value) {
        rotatey(value, model, temp_mat)
      }

    });
    var roateZ = slider.render({
      elem: '#slideTest3',
      max: 360,
      input: true, //输入框
      change: function (value) {
        rotatez(value, model, temp_mat)
      }
    });
    model_setting = layer.open({
      title: data.model_name,
      type: 1,
      content: $('#slider'),
      area: ['600px', '400px'],
      shade: 0,
      offset: 'r',
      btnAlign: 'c',
      btn: ['设置Position', 'Save New Position', 'Reset'],
      yes: function (index, layero) {
        pickNewPosition(data.model_id)
      },
      btn2: function (index, layero) {

        let new_modelMatrix = JSON.stringify(model.modelMatrix);
        console.log("Stringify modelMatrix", new_modelMatrix);
        var a = [];
        Cesium.Matrix4.toArray(model.modelMatrix, a);
        console.log('a', a);
        updateMatrix(a, data.model_id)
        model_setting = null;
      },
      btn3: function (index, layero) {
        //按钮【按钮三】的回调
        roateX.setValue(0);
        roateY.setValue(0);
        roateZ.setValue(0);
        model.modelMatrix = reset_mat;
        return false // 开启该代码可禁止点击该按钮关闭
      },
      cancel: function () {
        //右上角关闭回调
        model_setting = null;
        handler.destroy()
        handler = null;
        layer.msg("已退出 设置")
        //return false 开启该代码可禁止点击该按钮关闭
      }
    });
  })
}

// 
function searchAll_model() {
  layui.use(['layer', 'table', 'slider'], function () {
    var layer = layui.layer
    var table = layui.table
    var slider = layui.slider
    var count;
    $.getJSON('/model/getCount', function (result) {
      dataList = result

      count = dataList[0]['count(*)']
      console.log('dataList count', count)
    })
    layer.open({
      type: 1,
      title: 'Model',
      content: $('#search_model_table'),
      shadeClose: true,
      offset: ['100px', '700px'],
      shade: 0,
      skin: 'layui-layer-lan',
      success: function () {

        drawShowModel();
        // table
        table.render({
          id: 'table-model',
          toolbar: '#toolbarDemo',

          defaultToolbar: ['filter', { //自定义头部工具栏右侧图标。如无需自定义，去除该参数即可
            title: '刷新',
            layEvent: 'Refresh',
            icon: 'layui-icon-refresh'
          }],
          elem: '#search_model_table',
          size: 'lg',
          url: '/model/searchAll', // 数据接口
          parseData: function (res) {
            // var result = res.data.slice(this.limit * (this.page.curr - 1), this.limit * this.page.curr)
            // res 即为原始返回的数据
            return {
              code: res.status, // 解析接口状态
              msg: res.msg, // 解析提示文本
              count: count, // 解析数据长度
              data: res.data, // 解析数据列表
            }
          },
          height: 600,
          page: {
            limit: 5,
            limits: [5, 10, 15]
          }, // 开启分页
          cols: [
            [{
                type: 'checkbox',
                fixed: 'left'
              },
              {
                field: 'id',
                title: 'Show',
                width: 100,
                templet: function (d) {
                  if (d.isShow == 1) {
                    return (
                      '<button class="layui-btn layui-btn-primary item_show" Id="' +
                      d.model_id +
                      '" lay-event="hide">隐藏</button>'
                    )
                  } else if (d.isShow == 0) {
                    return (
                      '<button class="layui-btn layui-btn-primary item_show" Id="' +
                      d.model_id +
                      '" lay-event="show">显示</button>'
                    )
                  }
                }
              },
              {
                field: 'model_id',
                title: 'id',
                width: 150,
                sort: true

              },
              {
                field: 'model_name',
                title: 'Name',
                width: 200,
                sort: true
              },
              {
                field: 'model_id',
                title: 'Option',
                width: 100,
                templet: function (d) {
                  return (
                    '<button type="button" class="layui-btn layui-btn-sm " ' +
                    'lay-event="update" Id="' + d.object_id + '">' +
                    '<i class="layui-icon layui-icon-edit"></i>设置</button>'
                  )
                }
              }
            ]
          ]
        })
      },
      end: function () {
        $("[lay-id = 'table-model']").remove()
      }
    });

    table.on('toolbar(search_model_table)', function (obj) {
      var checkStatus = table.checkStatus(obj.config.id);
      switch (obj.event) {
        case 'getCheckData':
          var data = checkStatus.data;
          layer.alert(JSON.stringify(data));
          break;
        case 'getCheckLength':
          var data = checkStatus.data;
          layer.msg('选中了：' + data.length + ' 个');
          break;
        case 'isAll':
          layer.msg(checkStatus.isAll ? '全选' : '未全选');
          break;
          //自定义头工具栏右侧图标 - 提示
        case 'Refresh':
          table.reload("table-model", {})
          break;
      };
    });

    // show and hide
    table.on('tool(search_model_table)', function (obj) {
      var data = obj.data;

      // hide
      if (obj.event === 'hide') {
        layer.msg('隐藏 ID :' + data.model_id)
        // 改变 show
        for (let i = 1; i < collection.length; ++i) {
          var p = collection.get(i)
          if (p.id._id == data.model_id) {
            p.show = false
            console.log(data.model_id, "has hide")
          }
        }
        // 更新 isShow 为 0
        UpdateisShow(data.model_id, 0)
        table.reload("table-model", {})
      }
      // show 
      else if (obj.event === 'show') {
        layer.msg('显示 ID  :' + data.model_id)
        for (let i = 1; i < collection.length; ++i) {
          var p = collection.get(i)
          if (p.id._id == data.model_id) {
            console.log('model (' + data.model_id + ') 已存在! ')
            p.show = true
            // 更新 isShow 为 1
            UpdateisShow(data.model_id, 1)
            table.reload("table-model", {})
          }

        }
        searchModelFromId(data.model_id)
        console.log(data.model_id, "has create")
        UpdateisShow(data.model_id, 1)
        table.reload("table-model", {})
      }
      // update
      else if (obj.event === 'update') {
        var data = obj.data;
        var model;
        if (model_setting) {

          layer.msg("请先关闭当前的 设置窗口，再开启新的！", {
            icon: 2,
            anim: 6,
            offset: 't'
          })
        } else {
          Opensetting(data, model);
        }
      }
    });
  })
}






// HTML overlay for showing feature name on mouseover
var nameOverlay = document.createElement('div')
viewer.container.appendChild(nameOverlay)
nameOverlay.className = 'backdrop'
nameOverlay.style.display = 'none'
nameOverlay.style.position = 'absolute'
nameOverlay.style.bottom = '0'
nameOverlay.style.left = '0'
nameOverlay.style['pointer-events'] = 'none'
nameOverlay.style.padding = '4px'
nameOverlay.style.backgroundColor = 'black'

var selected = {
  feature: undefined,
  originalColor: new Cesium.Color()
}
var selectedEntity = new Cesium.Entity()

var clickHandler = viewer.screenSpaceEventHandler.getInputAction(
  Cesium.ScreenSpaceEventType.LEFT_CLICK
)

viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
  // Pick a new feature
  var pickedFeature = viewer.scene.pick(movement.endPosition)

  if (!Cesium.defined(pickedFeature)) {
    nameOverlay.style.display = 'none'
    return
  }
  // A feature was picked, so show it's overlay content
  nameOverlay.style.display = 'block'
  nameOverlay.style.color = 'white'
  nameOverlay.style.bottom =
    viewer.canvas.clientHeight - movement.endPosition.y + 'px'
  nameOverlay.style.left = movement.endPosition.x + 'px'
  nameOverlay.textContent = 'NULL'
  nameOverlay.textContent = pickedFeature.id._name
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
  // Pick a new feature
  var pickedFeature = viewer.scene.pick(movement.position)
  if (Cesium.defined(pickedFeature)) {
    console.log(pickedFeature);
    if (pickedFeature.id._id && pickedFeature.id._name) {
      selectedEntity.description =
        'Loading <div class="cesium-infoBox-loading"></div>'
      viewer.selectedEntity = selectedEntity
      selectedEntity.description =
        '<table class="cesium-infoBox-defaultTable"><tbody>' +
        '<tr><th>name</th><td>' +
        pickedFeature.id._id +
        '</td></tr>' +
        '<tr><th>ID</th><td>' +
        pickedFeature.id._name +
        '</td></tr>' +
        '</tbody></table>'
    }
  }


}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
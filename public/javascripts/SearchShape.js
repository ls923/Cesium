$(function () {
  $(".search_a").click(function () {
    $(".search ").fadeIn();
    searchAll_shape();
  });
});

function del_Shape(id) {
  $.ajax({
    type: "get",
    url: "/add_shape/delete",
    data: {
      delete_id: id
    },
    success: function (result) {
      console.log(result);
      searchAll_shape();
    },
  });
}

function Show_shape(id, type) {
  $.ajax({
    type: "get",
    url: "/add_shape/getPositions",
    data: {
      delete_id: id
    },
    success: function (result) {
      console.log(result)
      console.log(result[0]);
      console.log("positions", JSON.parse(Object.values(result[0])[0]))
      var positions = JSON.parse(Object.values(result[0])[0]);
      var arr = [];
      for (let i in positions) {

        arr.push(positions[i])
      }
      console.log(positions[0])
      if (type == 'polyline') {
        viewer.entities.add({
          name: 'Red line on terrain',
          polyline: {
            positions: positions,
            width: 4,
            material: Cesium.Color.WHITE.withAlpha(0.5),
            clampToGround: true,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          }
        });
        layer.msg('read polyline complete!', {
          time: 3000,
          anim: 3,
        });
      } else {
        viewer.entities.add({
          name: 'Red polygon on terrain',
          polygon: {
            hierarchy: positions,
            material: new Cesium.ColorMaterialProperty(
              Cesium.Color.WHITE.withAlpha(0.5)
            ),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          }
        })
        layer.msg('read polygon complete!', {
          time: 3000,
          anim: 3,
        });
      }
    }
  });
}

function searchAll_shape() {
  layui.use(['layer', 'table'], function () {
    var layer = layui.layer
    var table = layui.table
    var count;
    $.getJSON('/add_shape/getCount', function (result) {
      dataList = result
      console.log('dataList')
      count = dataList[0]['count(*)']
      console.log(count)
    })
    layer.open({
      type: 1,
      title: 'Shape',
      content: $('#search_shape_table'),
      shadeClose: true,
      offset: "",
      shade: 0,
      skin: 'layui-layer-lan',
      success: function () {
        // table
        table.render({
          id: 'table-shape',
          toolbar: '#toolbarDemo',
          defaultToolbar: '',
          elem: '#search_shape_table',
          size: 'lg',
          url: '/add_shape/searchAll', // 数据接口
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
          height: 300,
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
                title: 'id',
                width: 100,
                sort: true

              },
              {
                field: 'object_name',
                title: 'Name',
                width: 100,
                sort: true
              },
              {
                field: 'object_type',
                title: 'type',
                width: 100,
                sort: true
              },
              {
                field: 'object_id',
                title: 'Options',
                width: 100,
                templet: function (d) {
                  return (
                    '<button type="button" class="layui-btn layui-btn-sm layui-btn-normal" ' +
                    'lay-event="del" Id="' + d.object_id + '">' +
                    '<i class="layui-icon layui-icon-delete"></i>删除</button>'
                  )
                }
              },
              {
                field: 'object_id',
                title: 'Show',
                width: 100,
                templet: function (d) {
                  return (
                    '<button type="button" class="layui-btn layui-btn-sm " ' +
                    'lay-event="show" Id="' + d.object_id + '">' +
                    '<i class="layui-icon layui-icon-edit"></i>显示</button>'
                  )
                }
              }
            ]
          ]
        })
      },
      end: function () {
        $("[lay-id = 'table-shape']").remove()
      }
    });

    // show and hide
    table.on('tool(search_shape_table)', function (obj) {
      var data = obj.data;
      console.log(obj)
      // del
      if (obj.event === 'del') {
        layer.confirm('是否删除？ ', {
          icon: 3,
          title: '提示'
        }, function (index) {
          del_Shape(data.object_id);
          layer.close(index);
        });

        table.reload("table-shape", {})
      } else if (obj.event === 'show') {
        Show_shape(data.object_id, data.object_type);
      }
    });
  })
}
$(function () {
    $('.model_a').click(function () {
        $('.search-model').fadeIn()
        searchAll_model()
    })
})
var collection = viewer.scene.primitives

// model

function searchAll_model() {
    var count
    var perPage = 6
    var dataList = []
    var totalPage
    var curPage = 1
    $.getJSON("/model/searchAll", function (result) {
        console.log("SearchAll Json:")
        console.log(result)
        count = result.length
        dataList = result
        totalPage = Math.ceil(count / 7)
        $(".search-tb-model").html("")

        var index = perPage

        console.log("new index")
        console.log(index)
        if (curPage == 1) {
            $(".pre").css("display", "none")
        } else if (curPage == totalPage) {
            $(".next").fadeOut()
        }
        dataDisplay(dataList, 0, index)
        $(".next").click(function () {
            curPage++; /*每次点击下一页，页数+1*/

            if (curPage + 1 > totalPage) {
                $(".next").fadeOut()
            } else {
                $(".next").fadeIn()
            }

            if (curPage - 1 < 1) {
                $(".pre").fadeOut()
            } else {
                $(".pre").fadeIn()
            }
            $(".search-tb-model").empty(); /*清空上一页显示的数据*/
            if (curPage < totalPage) {
                console.log("start")
                console.log(index)
                dataDisplay(dataList, index, (index = index + perPage))
                console.log("end")
                console.log(index)
            } else if (curPage == totalPage) {
                console.log("start")
                console.log(index)
                dataDisplay(dataList, index, (index = index + (count % perPage)))
                console.log("end")
                console.log(index)
                console.log("count")
                index = index - (count % perPage) + perPage
                console.log(index)
            }

            /*显示新一页的数据，*/
        })
        $(".pre").click(function () {
            curPage--; /*每次点击上一页，页数-1*/

            if (curPage - 1 < 1) {
                $(".pre").fadeOut()
            } else {
                $(".pre").fadeIn()
            }

            if (curPage + 1 > totalPage) {
                $(".next").fadeOut()
            } else {
                $(".next").fadeIn()
            }
            $(".search-tb-model").empty(); /*清空上一页显示的数据*/
            if (curPage - 1 < 1) {
                console.log("start")
                console.log(index)
                dataDisplay(dataList, 0, (index = 6))
                console.log("end")
                console.log(index)
            } else {
                console.log("start")
                console.log(index - 2 * perPage)
                dataDisplay(
                    dataList,
                    (index = index - 2 * perPage),
                    (index = index + perPage)
                )
                console.log("end")
                console.log(index)
            }

            /*显示新一页的数据，*/
        })

        $.each(result, function (i, n) {
            if (n.isShow == 1) {
                //   var btnContent = "显示"
                var positions = JSON.parse(n.model_position)
                var item = {
                    id: n.model_id,
                    name: n.model_name,
                    position: [positions.position[0], positions.position[1]],
                    url: n.model_url,
                }
                console.log(item)
                drawModel(item)
                console.log(collection)
            }
        })
    })
}

function dataDisplay(dataList, start, fin) {
    for (var i = start; i < fin; i++) {
        if (dataList[i].isShow == 0) {
            var btnContent = "显示"
        } else {
            var btnContent = "隐藏"
        }
        $(".search-tb-model").append(
            "<tr>" +
            "<td><button type='button' class='btn btn-default btn-xs item_show'  id=" +
            dataList[i].model_id +
            ">" +
            btnContent +
            "</button></td>" +
            "<td>" +
            dataList[i].model_name +
            "</td>" +
            "</tr>"
        )
    }
}



function searchModelFromId(id) {
    var items;
    $.ajax({
        type: 'get',
        url: '/model/searchFrom_model_id',
        data: {
            model_id: id
        },
        success: function (result) {
            $('#tips_insert_success').fadeIn('slow').delay(1000).fadeOut('slow')
            $('#tips_insert_success>span').html('').append('query one SUCCESS')

            items = JSON.parse(result)
            var positions = JSON.parse(items[0].model_position)
            var item = {
                id: items[0].model_id,
                name: items[0].model_name,
                position: [positions.position[0], positions.position[1]],
                url: items[0].model_url
            }
            console.log(item)
            drawModel(item)
            console.log(collection)
        }
    })
}

function UpdateisShow(id, val) {
    $.getJSON(
        '/model/UpdateIsShow', {
            model_id: id,
            isShow: val
        },
        function (result) {
            console.log('Update Json:  isShow:', val)
            console.log(result.message)
        }
    )
}

function drawModel(item) {
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
    console.log(model.id._id)
    console.log(model.id._name)
}



$(function () {
    $("[lay-id = 'table-model']").on('click', '.item_show', function () {
        var items
        var state = $(this).text()
        console.log(state)
        if (state == '显示') {
            var id = $(this).attr('id')
            console.log(id)
            for (var i = 1; i < collection.length; ++i) {
                var p = collection.get(i)
                if (p.id._id == id) {
                    console.log('model 已存在! ')
                    p.show = true
                    $(this).text('隐藏')
                    // 更新 isShow 为 1
                    $.getJSON(
                        '/model/UpdateIsShow', {
                            model_id: id,
                            isShow: 1
                        },
                        function (result) {
                            console.log('Update Json:')
                            console.log(result.message)
                        }
                    )
                    return
                }
            }
            $.ajax({
                type: 'get',
                url: '/model/searchFrom_model_id',
                data: {
                    model_id: id
                },
                success: function (result) {
                    $('#tips_insert_success').fadeIn('slow').delay(1000).fadeOut('slow')
                    $('#tips_insert_success>span').html('').append('query one SUCCESS')

                    items = JSON.parse(result)
                    var positions = JSON.parse(items[0].model_position)
                    var item = {
                        id: items[0].model_id,
                        name: items[0].model_name,
                        position: [positions.position[0], positions.position[1]],
                        url: items[0].model_url
                    }
                    console.log(item)
                    drawModel(item)
                    console.log(collection)
                }
            })
            // 更新 isShow 为 1
            $.getJSON('/model/UpdateIsShow', {
                model_id: id,
                isShow: 1
            }, function (
                result
            ) {
                console.log('Update Json:')
                console.log(result.message)
            })

            $(this).text('隐藏')
        } else if (state == '隐藏') {
            // 改变 show
            var id = $(this).attr('id')
            for (var i = 1; i < collection.length; ++i) {
                var p = collection.get(i)
                if (p.id._id == id) {
                    p.show = false
                }
            }
            // 更新 isShow 为 0
            $.getJSON('/model/UpdateIsShow', {
                model_id: id,
                isShow: 0
            }, function (
                result
            ) {
                console.log('Update Json:')
                console.log(result.message)
            })
            $(this).text('显示')
        }
    })
})



// //a
// var jxl_a = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(87604),
//   })
// )

// //b
// var jxl_b = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(87646),
//   })
// )

// //c
// var jxl_c = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(87647),
//   })
// )

// //d
// var jxl_d = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(87649),
//   })
// )

// //e
// var jxl_e = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(87655),
//   })
// )

// //f
// var jxl_f = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(87657),
//   })
// )

// //g
// var jxl_g = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(87658),
//   })
// )

// // q,m,n
// var jxl_qmn = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(87955),
//   })
// )

// // zhl
// var zhl = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(87661),
//   })
// )

// // 音乐学院
// var yyxy = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(88003),
//   })
// )

// // 逸夫楼
// var yfl = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(87956),
//   })
// )
// // 游泳馆
// var yyg = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(88005),
//   })
// )
// // 无人机
// var wrj = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(87954),
//   })
// )

// //大活
// var dh = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(88119),
//   })
// )

// // 体育馆
// var tyg = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(88120),
//   })
// )

// // 二食堂
// var st_2 = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(87963),
//   })
// )

// // 一食堂
// var st_1 = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(88116),
//   })
// )

// // 三食堂
// var st_3 = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(88245),
//   })
// )

// //图书馆
// var tsg = viewer.scene.primitives.add(
//   new Cesium.Cesium3DTileset({
//     url: Cesium.IonResource.fromAssetId(87660),
//   })
// )

// 1-2

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
    console.log(pickedFeature)
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
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
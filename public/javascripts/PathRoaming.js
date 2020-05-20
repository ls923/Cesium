import {
    wgs2gcj,
    gcj2wgs
} from "./WGS84_to_GCJ02.js"


$(".path_roaming").click(function () {
    layer.msg('鼠标左键选择两个点，开始路径规划！', {
        time: 1500,
        anim: 0
    }, function () {
        layer.alert('Path Roaming', {
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
    var isClickAgain = false;
    var start = null;
    var end = null;
    var point_model = null;

    handler.setInputAction(function (event) {
        var cartesian = getCatesian3FromPicked(event.position, viewer);
        // 如果是第一次点击这个position
        if (!isClickAgain) {
            isClickAgain = true;
            start = viewer.entities.add({
                name: "起始点",
                position: cartesian,
                billboard: {
                    image: '../images/start.png',
                    scale: 0.2,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                }
            });
            return;
        }
        // 选择第二个点
        if (isClickAgain) {

            end = viewer.entities.add({
                name: "结束点",
                position: cartesian,
                billboard: {
                    image: '../images/fin.png',
                    scale: 0.2,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                }
            });
            console.log("两个点的坐标分别为:");
            console.log(start.position.getValue(), end.position.getValue())
            showRes(start.position.getValue(), end.position.getValue());
            handler.destroy();
        }

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);


    //  从选择的position 返回一个Catesian3对象 用于点的创建
    function getCatesian3FromPicked(ep, viewer, entity) {
        // ep event.position
        var truePick = null;
        var cartesian;
        var pick = viewer.scene.pick(ep)

        // 返回所有对象的对象列表
        var drillPick = viewer.scene.drillPick(ep);

        // 如果选取的点已经有 entity 存在
        if (entity) {
            for (var i = 0; i < drillPick.length; i++) {
                if (drillPick[i].id._id != entity.id) {
                    truePick = drillPick[i].id;
                    break;
                }
            }
        } else {
            truePick = pick;
        }
        // 是否支持 Scene＃pickPosition 函数，支持则返回 true 。
        if (viewer.scene.pickPositionSupported && Cesium.defined(truePick)) {
            cartesian = viewer.scene.pickPosition(ep);
        } else {
            var ray = viewer.camera.getPickRay(ep);
            if (!ray) return;
            cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        }
        console.log("click and get the cartesian:");
        console.log(cartesian);
        return cartesian;
    }

    // 从cartesian对象获得 经纬度  并且由 WGS84 转换为 GCJ02 坐标系
    function cartesianToLnglat(cartesian, isToWgs84) {
        if (!cartesian) return;
        var ellipsoid = viewer.scene.globe.ellipsoid;
        // 由 cartesian 返回 包含 经纬高度 （弧度为单位）的对象
        var lnglat = ellipsoid.cartesianToCartographic(cartesian);
        //var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        if (isToWgs84) {
            // 将弧度转化为度
            var lat = Cesium.Math.toDegrees(lnglat.latitude);
            var lng = Cesium.Math.toDegrees(lnglat.longitude);
            var hei = lnglat.height;
            return [lng, lat, hei];
        } else {
            return [lnglat.longitude, lnglat.latitude, lnglat.height];
        }
    }

    // 将 经纬度 坐标数组转换 为 cartseian 对象
    function lnglatArrToCartesianArr(lnglatArr) {
        if (!lnglatArr) return [];
        var arr = [];
        for (var i = 0; i < lnglatArr.length; i++) {
            arr.push(Cesium.Cartesian3.fromDegrees(lnglatArr[i][0], lnglatArr[i][1], lnglatArr[i][2] || 0));
        }
        return arr;
    }

    //  将两个点的经纬度通过 ajax 传入 api 返回得到 路径
    function showRes(start, end) {
        if (!start || !end) return;
        // 获得两个点的经纬度
        var startP = cartesianToLnglat(start, true);
        var endP = cartesianToLnglat(end, true);
        console.log("startp, endp:(WGS84)");
        console.log(startP, endP);
        var search = searchRoute(
            [startP[0], startP[1]],
            [endP[0], endP[1]],
            function (data) {
                addRouteLine(data[0]);
            });
    }

    // 路径规划
    function searchRoute(startp, endp, callback) {
        startp = wgs2gcj(startp);
        endp = wgs2gcj(endp);
        console.log("startp , endp (GCJ02)");
        console.log(startp, endp);
        var data = {
            key: '53e857a31b7e40e2b85d45659778b73e',
            origin: startp[0] + "," + startp[1],
            destination: endp[0] + "," + endp[1],
        }
        var index = layer.open({
            type: 3,
            icon: 1,
            time: 5 * 1000
        });
        $.get("https://restapi.amap.com/v3/direction/walking?", data, function (res, status) {
            console.log("result for all:");
            console.log(res);
            var temp;
            if (!res || !res.route || !res.route.paths) {
                temp = "";
            }
            layer.close(index);
            layer.msg('路径规划成功！', {
                icon: 1,
                time: 2000, //2秒关闭（如果不配置，默认是3秒）
                offset: 't'
            }, function () {
                //do something
            });
            temp = res.route.paths;
            callback(temp);
        })


    }

    // 将规划得到的路径添加到scene中
    function addRouteLine(res) {
        var arr = [];
        var steps = res.steps;
        console.log("path steps")
        console.log(steps)
        for (var i = 0; i < steps.length; i++) {
            var item = steps[i];
            // 得到一段路径的（position）
            var positionStr = item.polyline;

            // 分割成数组
            var strArr = positionStr.split(";");
            for (var z = 0; z < strArr.length; z++) {
                var item2 = strArr[z];
                var strArr2 = item2.split(",");

                var p = gcj2wgs(strArr2);
                arr.push(p);
            }
        }
        // 通过 经纬度坐标数组 得到 cartesian 对象
        var cartesians = lnglatArrToCartesianArr(arr);
        var line = viewer.entities.add({
            polyline: {
                positions: cartesians,
                clampToGround: true,
                material: Cesium.Color.RED.withAlpha(1),
                width: 2
            }
        });
        layer.open({
            title: 'Roaming',
            shade: 0,
            offset: 'r',
            btnAlign: 'c',
            btn: ['开始', '暂停', '继续', 'View on point'],
            yes: function (index, layero) {
                moveOnRoute(line);
            },
            btn2: function (index, layero) {
                //按钮【按钮二】的回调
                viewer.clock.shouldAnimate = false;
                return false //开启该代码可禁止点击该按钮关闭
            },
            btn3: function (index, layero) {
                //按钮【按钮三】的回调
                viewer.clock.shouldAnimate = false;
                return false // 开启该代码可禁止点击该按钮关闭
            },
            btn4: function (index, layero) {
                if (point_model) {
                    viewer.trackedEntity = point_model;
                } else {
                    layer.msg('先规划路线!');

                }
                return false // 开启该代码可禁止点击该按钮关闭
            },
            cancel: function () {
                //右上角关闭回调

                //return false 开启该代码可禁止点击该按钮关闭
            }
        });

    }

    // 计算property 对象
    function computeProperty(positions, startTime, v) {
        var property = new Cesium.SampledPositionProperty();
        var t = 0;
        for (var i = 1; i < positions.length; i++) {
            if (i == 1) {
                property.addSample(startTime, positions[0]);
            }
            var dis = Cesium.Cartesian3.distance(positions[i], positions[i - 1]);
            var time = dis / v + t;
            var julianDate = Cesium.JulianDate.addSeconds(startTime, time, new Cesium.JulianDate());
            property.addSample(julianDate, positions[i]);
            t += dis / v;
        }
        return property;
    }

    // 路径漫游
    function moveOnRoute(lineEntity) {
        if (!lineEntity) return;
        // 获得当前路径的cartesian对象
        var positions = lineEntity.polyline.positions.getValue();
        console.log("当前路径的cartesian对象")
        console.log(positions);
        if (!positions) return;

        var allDis = 0; //总距离

        for (var index = 0; index < positions.length - 1; index++) {

            var dis = Cesium.Cartesian3.distance(positions[index], positions[index + 1]);
            allDis += dis;
        }
        console.log("路径总距离为:")
        console.log(allDis);

        var playTime = 100; //漫游时间
        var v = allDis / playTime; // 漫游速度
        var startTime = viewer.clock.currentTime; // 开始时间
        var endTime = Cesium.JulianDate.addSeconds(startTime, playTime, new Cesium.JulianDate()); //将提供的秒数添加到提供的日期实例中。

        // 实现 model 的移动
        var property = computeProperty(positions, startTime, v);
        console.log("property position:");
        console.log(property);

        if (point_model) {
            window.viewer.entities.remove(point_model);
            point_model = null;
        }
        point_model = viewer.entities.add({

            position: property,
            orientation: new Cesium.VelocityOrientationProperty(property),
            point: {
                // url: '../gltf/circle.gltf'
                name: "point",
                color: Cesium.Color.WHITE.withAlpha(1),
                pixelSize: 10,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            }

        });
        viewer.clock.currentTime = startTime;
        viewer.clock.multiplier = 1;
        viewer.clock.shouldAnimate = true;
        viewer.clock.stopTime = endTime;
    }
})
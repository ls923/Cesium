var options = {
    camera: viewer.scene.camera,
    canvas: viewer.scene.canvas,
    clampToGround: true //开启贴地
};

var url = "../kml/map.kml";
viewer.dataSources.add(Cesium.KmlDataSource.load(url, options)).then(function (dataSource) {
    viewer.clock.shouldAnimate = false;
    var rider = dataSource.entities.getById('tour');
    // viewer.flyTo(rider).then(function () {
    //     viewer.trackedEntity =rider;
    //     viewer.selectedEntity=viewer.trackedEntity;
    //     viewer.clock.multiplier=30;
    //     viewer.clock.shouldAnimate =true;
    // });
});
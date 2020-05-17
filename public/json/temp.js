var viewer = new Cesium.Viewer("cesiumContainer", {
    infoBox: false, //Disable InfoBox widget
    selectionIndicator: false, //Disable selection indicator
    shouldAnimate: true, // Enable animations
    terrainProvider: Cesium.createWorldTerrain(),
});


//Set the random number seed for consistent results.
Cesium.Math.setRandomNumberSeed(3);

//Set bounds of our simulation time
var start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
var stop = Cesium.JulianDate.addSeconds(
    start,
    360,
    new Cesium.JulianDate()
);

//Make sure viewer is at the desired time.
viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
viewer.clock.multiplier = 10;

//Set timeline to simulation bounds
viewer.timeline.zoomTo(start, stop);

//Generate a random circular pattern with varying heights.
function computeCirclularFlight(lon, lat, radius) {
    var property = new Cesium.SampledPositionProperty();
    for (var i = 0; i <= 360; i += 45) {
        var radians = Cesium.Math.toRadians(i);
        var time = Cesium.JulianDate.addSeconds(
            start,
            i,
            new Cesium.JulianDate()
        );
        var position = Cesium.Cartesian3.fromDegrees(
            lon + radius * 1.5 * Math.cos(radians),
            lat + radius * Math.sin(radians),
            Cesium.Math.nextRandomNumber() * 500 + 1750
        );
        property.addSample(time, position);

        //Also create a point for each sample we generate.
        viewer.entities.add({
            position: position,
            point: {
                pixelSize: 8,
                color: Cesium.Color.TRANSPARENT,
                outlineColor: Cesium.Color.YELLOW,
                outlineWidth: 3,
            },
        });
    }
    return property;
}

//Compute the entity position property.
var position = computeCirclularFlight(-112.110693, 36.0994841, 0.03);

//Actually create the entity
var entity = viewer.entities.add({

    position: position,
    orientation: new Cesium.VelocityOrientationProperty(position),
    model: {
        uri: "../SampleData/models/CesiumAir/Cesium_Air.glb",
        minimumPixelSize: 64,
    },
});




Sandcastle.addToolbarButton("View Aircraft", function () {
    viewer.trackedEntity = entity;
});

//Add a combo box for selecting each interpolation mode.
Sandcastle.addToolbarMenu(
    [{
        text: "Interpolation: Linear Approximation",
        onselect: function () {
            entity.position.setInterpolationOptions({
                interpolationDegree: 3,
                interpolationAlgorithm: Cesium.LinearApproximation,
                // Cesium.LagrangePolynomialApproximation
            });
        },
    }, ],
    "interpolationMenu"
);
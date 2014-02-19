var map, layer;

$(document).ready(function () {
  var init = false;
  $('#map-tab a').on('shown.bs.tab', function (e) {
    if (init) return;
    init = true;
    map = new OpenLayers.Map('map');
    layer = new OpenLayers.Layer.OSM( "Simple OSM Map");
    map.addLayer(layer);
    map.setCenter(
        new OpenLayers.LonLat(-71.147, 42.472).transform(
            new OpenLayers.Projection("EPSG:4326"),
            map.getProjectionObject()
        ), 12
    );
  });
});

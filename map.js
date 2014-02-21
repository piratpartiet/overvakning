var map, layer;

var data = {};

function padDigits(number, digits) {
  return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

$(document).ready(function () {
  var mapTabClicked;

  async.series([
    function(cb){
      $.get("world.geojson", function (geojson) { data.worldmap = geojson; cb (); }, "json");
    },

    function(cb){
      $.get("Privacy International - National Privacy Ranking 2007.csv", function (privacy_ranking) {
        data.privacy_ranking = {};
        $.csv.toObjects(privacy_ranking).map(function (country) {
          for (var key in country) {
            if (key != 'Country') {
              country[key] = parseFloat(country[key]);
            }
          }
          data.privacy_ranking[country.Country] = country;
        });
        cb();
      });
    },

    function(cb){
      for (var feature = 0; feature < data.worldmap.features.length; feature++) {
        var properties = data.worldmap.features[feature].properties;
        if (data.privacy_ranking[properties.ISO_2_CODE]) {
          $.extend(properties, data.privacy_ranking[properties.ISO_2_CODE]);
        }
      }
      cb();
    },

    function (cb) {
      mapTabClicked = cb;
    },

    function (cb) {
      map = new OpenLayers.Map('map');

      map.addControl(new OpenLayers.Control.Navigation());
      map.addControl(new OpenLayers.Control.LayerSwitcher());

      /*
        layer = new OpenLayers.Layer.OSM( "Simple OSM Map");
        map.addLayer(layer);
      */

      layer = new OpenLayers.Layer.WMS( "OpenLayers WMS", 
              "http://vmap0.tiles.osgeo.org/wms/vmap0",
              {layers: 'basic'} );
      map.addLayer(layer);

      map.setCenter(
          new OpenLayers.LonLat(-71.147, 42.472).transform(
              new OpenLayers.Projection("EPSG:4326"),
              map.getProjectionObject()
          ), 2
      );

      var style = new OpenLayers.Style({
        fillColor : "${getBlockColor}",
      },{context: {
        getBlockColor: function (feature) {
          var score = feature.data.Total || 0;
          var red = padDigits((255 / 5 * (5 - score)).toString(16), 2)
          var green = padDigits((255 / 5 * score).toString(16), 2)
          var blue = "00";
          return "#" + red + green + blue;
        }
      }});

      var geojson_format = new OpenLayers.Format.GeoJSON();
      var vector_layer = new OpenLayers.Layer.Vector("Vector Layer", {styleMap: new OpenLayers.StyleMap({'default': style})});
      vector_layer.addFeatures(geojson_format.read(data.worldmap));
      map.addLayer(vector_layer);
      cb();
    }
  ],
  function(err, results){

  });
    $('#map-tab a').on('shown.bs.tab', function (e) { if (mapTabClicked) mapTabClicked(); mapTabClicked = false; });
});

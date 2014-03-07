var map, layer;

var state = {category: "Privacy International 2007/Total"};

function padDigits(number, digits) {
  return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

function getByCategory(data, category) {
  category.split("/").map(function (name) { if (data[name] == undefined) data[name] = {}; data = data[name]; });
  return data;
}

$(document).ready(function () {
  var mapTabClicked;

  async.series([
    function(cb){
      $.get("world.geojson", function (geojson) { data.worldmap = geojson; cb (); }, "json");
    },

    function(cb){
      $.get("maplinks.json", function (json) { data.maplinks = json; cb (); }, "json");
    },

    function(cb){
      $.get("country-rankings.csv", function (regiondata) {
        data.regiondata = {};
        data.categories = {};
        $.csv.toObjects(regiondata).map(function (info) {
          var category = info.Category;
          delete info.category;
          for (var region in info) {
            value = parseFloat(info[region]);
            if (value.toString() == "NaN") value = info[region];
            getByCategory(data.categories, category);
            if (data.regiondata[region] == undefined) data.regiondata[region] = {};
            getByCategory(data.regiondata[region], category).value = value;
          }
        });
        cb();
      });
    },

    function (cb) {
      mapTabClicked = cb;
    },

    function (cb) {
      map = new OpenLayers.Map({
        div: "map",
        allOverlays: true,
        maxExtent: new OpenLayers.Bounds(
          -180, -90, 180, 90
        )
      });

      map.addControl(new OpenLayers.Control.Navigation());
      // map.addControl(new OpenLayers.Control.LayerSwitcher());
    
      var style = new OpenLayers.Style({
        fillColor : "${getBlockColor}",
      },{context: {
        getBlockColor: function (feature) {
          var score;
          try {
            score = getByCategory(data.regiondata[feature.data.ISO_2_CODE], state.category).value;
            if (typeof(score) != "number") throw "not a number";
          } catch(e) {
            return "#999999";
          }
          var red = padDigits(Math.round(255 / 5 * (5 - score)).toString(16), 2)
          var green = padDigits(Math.round(255 / 5 * score).toString(16), 2)
          var blue = "00";
          return "#" + red + green + blue;
        }
      }});

      var geojson_format = new OpenLayers.Format.GeoJSON();
      var vector_layer = new OpenLayers.Layer.Vector("Vector Layer", {
        styleMap: new OpenLayers.StyleMap({'default': style}),
        eventListeners:{
          'featureselected':function(evt){
            var feature = evt.feature;

            function dataToTable(data) {
              if (data.value != undefined) return data.value;
              var res = "<table>";
              for (var key in data) {
                var sub = data[key];
                if (typeof(sub) == "object") {
                  if (sub.length != undefined) {
                    sub = JSON.stringify(sub);
                  } else {
                    sub = dataToTable(sub);
                  }
                }
                res += "<tr><th>" + key + "</th><td>" + sub + "</td></tr>";
              }
              res += "</table>";
              return res;
            }

            var popup = new OpenLayers.Popup.FramedCloud(
              "popup",
              OpenLayers.LonLat.fromString(feature.geometry.getCentroid().toShortString()),
              null,
              "<b>" + feature.data.NAME + "</b>" + dataToTable(data.regiondata[feature.data.ISO_2_CODE]),
              null,
              true
            );
            feature.popup = popup;
            map.addPopup(popup);
          },
          'featureunselected':function(evt){
            var feature = evt.feature;
            map.removePopup(feature.popup);
            feature.popup.destroy();
            feature.popup = null;
          }
        }
      });
      vector_layer.addFeatures(geojson_format.read(data.worldmap));
      map.addLayer(vector_layer);

      map.addControl(new OpenLayers.Control.SelectFeature(vector_layer, {
        autoActivate:true
      }));

      map.setCenter(
          new OpenLayers.LonLat(0, 0).transform(
              new OpenLayers.Projection("EPSG:4326"),
              map.getProjectionObject()
          ), 2
      );

      function addGroup(groups, slug, title, extra) {
        var group = $(".template .mapcontrol-category").clone();
        groups.append(group);
        group.find(".panel-title a").html(title);
        group.find(".panel-title a").attr({href: "#" + slug});
        if (extra) group.find(".panel-title").append(extra);
        group.find(".panel-collapse").attr({id: slug});
        return group.find(".panel-collapse .panel-body");
      }

      function addCategories(categories, parent, path) {
        path = path || [];
        parent = parent || $("#mapcontrols");

        var groupslug = $.slugify(path.join("-"));
        var groups = $("<div class='panel-group' id='" + groupslug + "'>");
        parent.append(groups);

        for (var category in categories) {
          if (category == "Source") continue;
          var categorypath = path.concat([category]);
          var categoryslug = $.slugify(categorypath);
          if (Object.keys(categories[category]).length > 0) {
            var link;
            var src = getByCategory(data.regiondata.All, categorypath.concat(["Source"]).join("/")).value;
            if (src) {
              link = $("<a class='pull-right'><i class='fa fa-external-link'></i></a>");
              link.attr({href: src});
            }
            addCategories(categories[category], addGroup(groups, categoryslug, category, link), categorypath);
          } else {
            var choice = $("<div><input type='radio' name='category' id='" + categoryslug + "' value='" + categorypath.join("/") + "'><label for='" + categoryslug + "'>" + category + "</label></div>");
            choice.find("input").change(function () {
              if (!$(this).is(':checked')) return;
              state.category = $(this).val();
              vector_layer.redraw();
            });
            parent.append(choice);
          }
        }
      }

      addCategories(data.categories);

      data.maplinks.map(function (item) {
        var html = $("<div><a></a></div>");
        var lnk = html.find("a");
        lnk.html(item.title);
        lnk.attr({href: item.source});
        $("#mapcontrols").append(html);
      });

      cb();

    }
  ],
  function(err, results){

  });
    $('#map-tab a').on('shown.bs.tab', function (e) { if (mapTabClicked) mapTabClicked(); mapTabClicked = false; });
});

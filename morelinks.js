$(document).ready(function () {
  async.series([

    function(cb){
      $.get("data/morelinks.json", function (json) { data.morelinks = json; cb (); }, "json");
    },

    function(cb){

      data.morelinks.map(function (item) {
        var html = $("<li><a></a></li>");
        var lnk = html.find("a");
        lnk.html(item.title);
        lnk.attr({href: item.source});
        $("#morelinks ul").append(html);
      });

    }
  ]);
});

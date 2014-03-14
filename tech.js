$(document).ready(function () {

  async.series([
    function(cb){
      $.get("tech.json", function (json) { data.tech = json; cb (); }, "json");
    },

    function(cb){
      function createGroup(category) {
        var group = $(".template .tech-category").clone();
        group.find(".panel-title").append(category.title);
        group.find(".panel-title .fa").addClass(category.icon);
        return group;
      }

      var groups = {};
      for (var i = 0; i < data.tech.categories.length; i++) {
        var category = data.tech.categories[i];
        var group = createGroup(category);
        groups[category.title] = group;
        if (i < data.tech.categories.length / 2) {
          $(".tech-left").append(group);
        } else {
          $(".tech-right").append(group);
        }
      }

      for (var i = 0; i < data.tech.tech.length; i++) {
        var item = data.tech.tech[i];
        var group = groups[item.category];
        var lst = group.find(".panel-body ul");
        var html = $("<li>");
        html.html(item.title);
        item.sources.map(function (source) {
          var lnk = $("<a><i class='fa fa-external-link'></i></a>");
          lnk.attr({href: source});
          html.append(lnk);
        });
        if (item.content) {
          var more = $("<div class='more'>")
          more.append(item.content);
          html.append(more);
        } 

        (function (html) {
          var timeout;
          html.mouseenter(function () {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(function () {
              timeout = undefined;
              html.addClass("expanded");
              html.find(".more").slideDown();
            }, 500);
          });
          html.mouseleave(function () {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(function () {
              timeout = undefined;
              html.removeClass("expanded");
              html.find(".more").slideUp();
            }, 500);
          });
        })(html);

        lst.append(html);
      }
    }
  ]);
});
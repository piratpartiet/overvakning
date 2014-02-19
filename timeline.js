$(document).ready(function () {
  $.get("stories.json", function (data) {
    var timelines = {};
    var idx = 0;
    data.timelines.map(function (timeline) {
      timeline.idx = idx;
      timelines[timeline.title] = timeline;
      var eltimeline = $(".template .timeline").clone();
      eltimeline.addClass(timeline.color);
      eltimeline.prepend(timeline.title);
      $(".timelines").append(eltimeline);
      idx++;
    });

    data.stories.map(function (story) {
      var timeline = timelines[story.timeline];

      var elstory = $(".template .story").clone();
      elstory.addClass(timeline.color);
      elstory.find(".time .main").html(story.time);
      elstory.find(".info").prepend(story.title);
      elstory.find(".info .more").html(story.content);
      if (story.minor) elstory.addClass("minor");

      if (timeline.idx < data.timelines.length / 2) {
        elstory.addClass("left");

        for (var i = 0; i < timeline.idx; i++) {
          elstory.find(".time").append("<div class='timeline-bump'>");
          elstory.find(".info-wrapper").append("<div class='timeline-bump'>");
        }

        for (var i = 0; i < data.timelines.length / 2 - timeline.idx - 1; i++) {
          elstory.append("<div class='timeline-bump'>");
        }

        elstory.append("<div class='even-bump'>");
        elstory.append("<div class='side-bump'>");
      } else {
        elstory.addClass("right");

        for (var i = 0; i < data.timelines.length - timeline.idx - 1; i++) {
          elstory.find(".time").prepend("<div class='timeline-bump'>");
          elstory.find(".info-wrapper").prepend("<div class='timeline-bump'>");
        }

        for (var i = 0; i < timeline.idx - data.timelines.length / 2; i++) {
          elstory.prepend("<div class='timeline-bump'>");
        }

        elstory.prepend("<div class='even-bump'>");
        elstory.prepend("<div class='side-bump'>");
      }

      (function (story) {
        var timeout;
        var info = story.find(".info");
        info.mouseenter(function () {
          if (timeout) clearTimeout(timeout);
          timeout = setTimeout(function () {
            timeout = undefined;
            if (story.hasClass("minor")) {
              if (story.hasClass("left")) {
                story.find(".story-wrapper").animate({"padding-left": 0});
              } else {
                story.find(".story-wrapper").animate({"padding-right": 0});
              }
              story.addClass("minor-expanded");
              story.removeClass("minor");
            }
            story.addClass("expanded");
            story.find(".more").slideDown();
          }, 500);
        });
        info.mouseleave(function () {
          if (timeout) clearTimeout(timeout);
          timeout = setTimeout(function () {
            timeout = undefined;
            story.removeClass("expanded");
            story.find(".more").slideUp();
            if (story.hasClass("minor-expanded")) {
              if (story.hasClass("left")) {
                story.find(".story-wrapper").animate({"padding-left": "30%"});
              } else {
                story.find(".story-wrapper").animate({"padding-right": "30%"});
              }
              story.addClass("minor");
              story.removeClass("minor-expanded");
            }
          }, 500);
        });
      })(elstory);

      $(".stories .inner-stories").append(elstory);
    });


  }, "json");
});

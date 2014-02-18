$(document).ready(function () {
  $(".story").each(function () {
    (function (story) {
      var timeout;
      story.mouseenter(function () {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(function () {
          timeout = undefined;
          story.find(".more").slideDown();
        }, 500);
      });
      story.mouseleave(function () {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(function () {
          timeout = undefined;
          story.find(".more").slideUp();
        }, 500);
      });
    })($(this));
  });
});

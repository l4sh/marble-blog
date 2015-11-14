/*
Author info plugin for MARBLE

It provides an author information widget

This plugin needs jQuery, Bootstrap and the resources plugin
*/

//** Set media links **//
function authorInfoMediaLinks() {
  var _s = false;
  var mediaLinks;

  for (var i in config.author) {
    if (icons.webIcons[i]) {
      if (!_s) {
        mediaLinks = '<ul class="list-inline">';
        _s = true;
      }
      mediaLinks += '<li><a href="' + config.author[i] + '">';
      mediaLinks += '<i class="fa ' + resources.icons.web[i] + '"></i></a></li>';
    }
  }
  if (mediaLinks) {
    mediaLinks += '</ul>';

    $('.media-links').html(mediaLinks);
  }
}

function loadAuthorInfo(area) {

}


plugin.authorInfo = {
  load: function(){

  }
};

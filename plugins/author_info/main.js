// Author info plugin for MARBLE
// It provides an author information widget

//** Set media links **//
function getMediaLinks() {
  var _s = false;
  var mediaLinks;

  for (var i in config.author) {
    if (resources.icons.web[i]) {
      if (!_s) {
        mediaLinks = '<ul class="list-inline">';
        _s = true;
      }

      var url = config.author[i];
      var icon = resources.icons.web[i];
      if (i === 'email') {
        url= 'mailto://' + url;
      }

      mediaLinks += '<li><a href="' + url + '">';
      mediaLinks += '<i class="fa ' + icon + '"></i></a></li>';
    }
  }
  if (mediaLinks) {
    return mediaLinks += '</ul>';
  }
}

function setAuthorInfo() {
  var mediaLinks = getMediaLinks() || '';

  var authorDiv = '<div id="author-info" class="row">';
  authorDiv += '<div class="col-md-12 text-center">';
  authorDiv += '<img class="img-circle center-block author-image" src="/images/blog/author.png">';
  authorDiv += '<h3 class="author-name">' + config.author.name + '</h3>';
  authorDiv += '<div class="media-links">' + mediaLinks + '</div>';
  authorDiv += '<p class="author-description">' + config.author.description + '</p>';
  authorDiv += '</div></div>';

  $(config.plugins.authorInfo.area).append(authorDiv);
}


$(function(){
  setAuthorInfo();
});

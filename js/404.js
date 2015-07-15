var posts;
var postListFile = config.blog.postsJSON;
var e404 = true;
var url;

function loadContent() {
  url = window.location.href;
  url = url.split('/');
  url = url[url.length - 1];
  // Check if post file exists
  if (JSON.stringify(posts).indexOf(url + '.md') > 0) {
    // and update the url, title and body
    var title = config.blog.title + ' - ' + url.replace(/_/g, ' ');
    document.title = title;
    $('body').load('index.html')
  }
};

(function() {
  $.getJSON(postListFile).done(function(data) {
    posts = data;
    loadContent();
  });
})();

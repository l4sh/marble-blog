'use strict';

var posts;
var postListFile = config.blog.postsJSON;
var e404 = true;
var url;

function updateTitle(newTitle) {
  newTitle = config.blog.title + ' - ' + newTitle;
  document.title = newTitle;
}

function loadE404Content() {
  var e404Content = '<div class="col-md-8 col-md-offset-1"><h1>404 ' +
    'Error: Page Not Found</h1><p>It seems like the content you are' +
    'looking for cannot be found...</p><p>Visit the <a href="inde' +
    'x.html">Home Page</a> for more posts.</p></div>';

  $('#e404-content').html(e404Content);
  updateTitle('404 Error: Page not found');
}

function loadContent() {
  // Check if post exists and load, or return 404 page
  url = window.location.href;
  url = url.split('/');
  url = url[url.length - 1];
  // Check if post file exists
  if (JSON.stringify(posts).indexOf(url + '.md') > 0) {
    // and update the url, title and body
    updateTitle(url.replace(/_/g, ' '));
    $('body').load('index.html');

  } else {
    loadE404Content();

  }
}

(function() {
  // Load post list and content on page load
  $.getJSON(postListFile).done(function(data) {
    posts = data;
    loadContent();
  });
})();

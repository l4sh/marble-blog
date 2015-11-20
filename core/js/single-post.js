'use strict';
var posts;
var postListFile = '/' + config.blog.postsJSON;
var isPost = true;
var url = window.location.href;
var domain = url.split('/').slice(0,3).join('/');
var postFileName = url.split('/').slice(-2)[0] + '.md';

(function() {
  // Load post list and content on page load
  $.getJSON(postListFile).done(function(data) {
    posts = data;
    //updateTitle(url.replace(/_/g, ' '));
    $('body').load('/index.html');
  });
})();

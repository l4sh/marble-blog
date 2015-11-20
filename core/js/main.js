'use strict';

var ppp = config.blog.postsPerPage;
var contentEl = '#blog-content';
//var postPath = '/' + config.blog.publishedFolder;
var postList;
var curPos = 0; // Current position in post list
//var pagerPosition = config.blog.pagerPosition;
var totalPosts; // Total amount of posts, available after postList load


//**** RUN ON LOAD ****//
$(function() {
  if (typeof isPost === 'undefined') {
    // Get the post list and load posts
    var postListFile = '/' + config.blog.postsJSON;

    $.getJSON(postListFile).done(function(data) {
      postList = data;
      totalPosts = size(postList);
      loadMultiplePosts();
    });


  } else {
    loadPost(postFileName);
  }
});

var ppp = config.blog.postsPerPage;
var contentEl = '#blog-content';
var postPath = config.blog.postsPath + config.blog.publishedFolder + '/';
var postListFile = config.blog.postsJSON;
var postList;
var curPos = 0; // Current position in post list
var pagerPosition = config.blog.pagerPosition;
var totalPosts; // Total amount of posts, available after postList load


//**** MAIN CONTENT ****//

// Insert post into element
function insertPost(postEl, postFile) {
  var postFile = postFile || postList[curPos].file;

  $.get(postPath + postFile).done(function(data) {

    data = splitPostData(data);
    var header = '<div class="post-header">';
    header += parseHeader(data[0], postFile);
    header += '</div>';

    var body = '<div class="post-body">';
    body += marked(data[1]); //MDtoHTML
    body += '</div>';

    // Insert content
    $(postEl).html(header + body);
  });
};

//** Load single post into main content element **//
function loadSinglePost(postName) {
  $(contentEl).html('');
  var postFile = postName + '.md'
  insertPost(contentEl, postFile);
};

//** Load posts into main content element **//
function loadPosts() {

  if (curPos >= totalPosts) {
    return;
  }

  $(contentEl).html('');

  for (var i = 0;
    (i < ppp) && (curPos < totalPosts); i++) {

    var postEl = 'post-' + i;
    var div = '<div id="' + postEl + '"></div>';
    $(contentEl).append(div);

    insertPost('#' + postEl);

    $(contentEl).append('<hr />');

    curPos++;
  }

};


//** Validate post format **//
function validatePost(data) {

  var ok = true;

  if (!data) {
    ok = false;

  } else if (data.indexOf('\n---\n') < 0) {
    ok = false;
  }

  return ok;
}


//** Split post data and return header and body **//
function splitPostData(data) {

  if (!validatePost(data)) {
    return;
  }

  data = data.split(/^---\n|\n---\n/);
  var body = data[2];
  var headerData = data[1].split('\n');
  var header = {};

  $.each(headerData, function(k, v) {
    // Process only non empty
    if (headerData[k]) {
      var _t = headerData[k].split(':');
      var key = _t[0].toLowerCase().trim();
      var val = _t[1].trim();

      // Put tags into an array and trim any spaces
      if (key == 'tags') {
        val = $.map(val.split(','), function(v) {
          return v.trim();
        });
      }
      header[key] = val;
    }
  });

  return [header, body];
};


//** Parse header and return HTML **//
function parseHeader(data, postFile) {
  var htmlHeader = '';

  postFile = postFile.split('.')[0];

  // If fields exist populate
  //// Title
  if (data.title) {
    htmlHeader += '<h1><a href="' + postFile + '">' + data.title + '</a></h1>';
  }

  htmlHeader += '<p>';

  //// Author
  if (data.author) {
    htmlHeader += 'by <strong>' + data.author + '</strong> ';
  }
  //// Date Written
  if (data.date) {
    //var _d = data.date.replace(/-/g, '')
    htmlHeader += 'on ' + parseDate(data.date) + ' ';
  }

  //// Date updated
  if (data.updated) {
    //var _d = data.updated.replace(/-/g, '');
    htmlHeader += 'updated on ' + parseDate(data.updated);
  }
  //// Tags
  if (size(data.tags) > 0) {
    $.each(data.tags, function(k, tag) {
      htmlHeader += ' <div class="post-tag">' + tag + '</div>';
    });
  }
  htmlHeader += '</p>'

  return htmlHeader
};


//** loadPager **//
function loadPager(position) {

  var pagerHTML = '<nav><ul class="pager"><li><a class="pager-previous" href="#">' +
    'Previous Page</a></li><li><a class="pager-next" href="#">' +
    'Next Page</a></li></ul></nav>'

  if (position == 'top') {
    $('.pager-top').html(pagerHTML);
  } else if (position == 'bottom') {
    $('.pager-bottom').html(pagerHTML);
  } else if (position == 'both') {
    $('.pager-top').html(pagerHTML);
    $('.pager-bottom').html(pagerHTML);
  }
};


//**** SIDEBAR ****//

//** Set media links **//
function setMediaLinks() {
  var _s = false;

  for (i in config.author) {
    if (icons.web_icons[i]) {
      if (!_s) {
        var media_links = '<ul class="list-inline">';
        _s = true;
      }
      media_links += '<li><a href="' + config.author[i] + '">';
      media_links += '<i class="fa ' + icons.web_icons[i] + '"></i></a></li>'
    }
  }
  if (media_links) {
    media_links += '</ul>';

    $('.media-links').html(media_links);
  }
};


//**** MISC ****//

//** Parse date **//
function parseDate(dateStr) {
  var date = new Date(dateStr)
  date = date.toLocaleString();
  return date;
};


//** Get array and object size **//
function size(iter) {

  var _s = $.map(iter, function(n, i) {
    return i;
  }).length;

  return _s;
};


//**** RUN ON LOAD ****//
$(function() {
  if (typeof e404 == 'undefined') {
    // Get the post list and load posts
    $.getJSON(postListFile).done(function(data) {
      postList = data;
      totalPosts = size(postList);
      loadPosts();
    });

    // Load the pager
    loadPager(pagerPosition);
    // Watch pager clicks and load previous/next page
    $('.pager').on('click', '.pager-previous', function() {
      curPos = curPos - (ppp * 2);
      if (curPos < 0) {
        curPos = 0;
      }
      loadPosts();
    });
    $('.pager').on('click', '.pager-next', function() {
      loadPosts();
    });
  } else {
    loadSinglePost(url);
  }
  // Set the author information in sidebar
  setMediaLinks();
});

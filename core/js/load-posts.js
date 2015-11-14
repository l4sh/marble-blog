//**** LOAD POSTS ****//

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


//** Parse header and return HTML **//
function parseHeader(data, postFile) {

  var htmlHeader = '';

  postFile = postFile.split('.')[0];

  // If fields exist populate
  //// Title
  if (data.title) {
    htmlHeader += '<h1><a href="/' + pathJoin(config.blog.postsFolder, postFile);
    htmlHeader += '">' + data.title + '</a></h1>';
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

  // Tags
  /** TODO: Support tags
  if (size(data.tags) > 0) {
    $.each(data.tags, function(k, tag) {
      htmlHeader += ' <div class="post-tag">' + tag + '</div>';
    });
  }
  **/

  htmlHeader += '</p>';

  return htmlHeader;
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

  $.each(headerData, function(k) {
    // Process only non empty
    if (headerData[k]) {
      var _t = headerData[k].split(':');
      var key = _t[0].toLowerCase().trim();
      var val = _t[1].trim();

      // Put tags into an array and trim any spaces
      if (key === 'tags') {
        val = $.map(val.split(','), function(v) {
          return v.trim();
        });
      }

      if (key === 'date') {
        val = _t.slice(1, _t.length).join(':').trim();
      }

      header[key] = val;
    }
  });

  return [header, body];
}


//** Insert post into element **//
function insertPost(postEl, postFile) {
  postFile = postFile || postList[curPos].file;
  var pubFolder = '/' + config.blog.publishedFolder;

  $.get(pathJoin(pubFolder, postFile)).done(function(data) {

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
}


//** Load single post into main content element **//
function loadPost(postFile) {
  $(contentEl).html('');
  insertPost(contentEl, postFile);
}


//** Load posts into main content element **//
function loadMultiplePosts() {

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

}

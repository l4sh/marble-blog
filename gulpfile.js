'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var mkdir = require('mkdir-p');
var fs = require('fs');
var colors = require('colors');
var mark = require('markup-js');
var stream = require('stream');
var path = require('path');

//** Prompt **//
var prompt = require('prompt');
prompt.message = '✪ '.red.bold;
prompt.delimiter = '';


//** Load Config **//
var posts = require('./posts.json');
var config = require('./config.js');


//** Run external editor **//
function editor(file) {
  var childProcess = require('child_process');
  var e = config.editor || process.env.EDITOR || 'vi';

  childProcess.spawn(e, [file], {
    stdio: 'inherit'
  });
}


//** Menu **//
function menu(menuTitle, menuItems, callback) {

  // Display title
  console.log('\n' + menuTitle.red.bold);
  console.log(new Array(menuTitle.length + 1).join('=').magenta.bold);

  // Show list of items
  for (var item in menuItems) {
    var itemNumber = '  ' + (Number(item) + 1) + ') ';
    var itemText = menuItems[item].split('.')[0];

    console.log((itemNumber + itemText).green.bold);
  }
  console.log('  0) EXIT\n'.red.bold);

  prompt.start();

  // Get user input and validate
  var getInput = function() {
    prompt.get({
      name: 'item',
      message: 'Item number:'.green,
      validator: /^[0-9]+$/,
      required: true,
      warning: 'Must be a number',
      default: 1
    }, function(err, answer) {

      if (err) {
        console.log(err);
        return;

      } else if (answer.item == 0) {
        process.exit();

      } else if (answer.item > menuItems.length) {
        // Re-run on invalid input
        console.log('error'.red + ':   Invalid option');
        getInput();

      } else if (callback && typeof(callback) === 'function') {
        answer.item -= 1;
        callback(answer.item);
      }
    });
  };

  getInput();
}


//** Confirm prompt **//
function inputConfirm(callback) {

  prompt.get({
    name: 'confirm',
    message: 'Confirm Y/n:'.green,
    validator: /^[yYnN]$/,
    warning: 'Must be Y or N'
  }, function(err, answer) {

    if (err) {
      console.log(err);
      return;
    }

    var result = /^[y|Y]/.test(answer.confirm);

    if (callback && typeof(callback) === 'function') {
      if (result) {
        callback();
      }
    }
  });
}


//** Format filename **//
function formatFname(string) {

  var reChars = [{
    plain: 'a',
    replace: /[\u00e0-\u00e5\u0100-\u0105]/g
  }, {
    plain: 'e',
    replace: /[\u00e8-\u00eb\u0112-\u011b]/g
  }, {
    plain: 'i',
    replace: /[\u00ec-\u00ef\u0128-\u0131]/g
  }, {
    plain: 'o',
    replace: /[\u00f2-\u00f8\u014c-\u0151]/g
  }, {
    plain: 'u',
    replace: /[\u00f9-\u00fc\u0168-\u0173]/g
  }, {
    plain: '-',
    replace: /[:\-,.\s\u00C0-\u017F]/g
  }];

  // Format to lower case and strip accents, etc.
  string = string.toLowerCase();

  for (var i in reChars) {
    string = string.replace(reChars[i].replace, reChars[i].plain);
  }

  return string;
}



//** Read post and get header info**//
function getPostInfo(fileName) {

  var data = fs.readFileSync(fileName, 'utf-8');
  data = data.split(/^---\n|\n---\n/);
  var headerData = data[1];
  var body = data[2];

  headerData = headerData.split('\n');
  var postInfo = {};

  for (var i in headerData) {

    if (headerData[i]) {
      var _t = headerData[i].split(':');
      var key = _t[0].toLowerCase().trim();
      var val = _t[1].trim();

      // Tags go to an array
      if (key === 'tags') {
        val = val.split(',');
        for (var a in val) {
          val[a] = val[a].trim();
        }
      }

      // Generate post excerpt if no description or too short
      if (key === 'description' && val.length < 10) {
        val = body.split(' ').slice(0, config.blog.excerptLength);
        val = val.join(' ').replace(/\n/g, ' ').trim();
      }

      postInfo[key] = val;
    }
  }

  // Add filename
  postInfo.file = path.basename(fileName);

  // Add post URL
  postInfo.url = path.join(config.blog.url, config.blog.postsFolder,
                           path.parse(postInfo.file).name)

  // Get post ID
  postInfo.id = genPostId();

  return postInfo;
}


//** Generate post ID number **//
function genPostId() {
  // Get the ID number of the last post and return the ID for the current post
  var postsJSON = posts;
  var postId = 0;
  var ids = postsJSON.map(function(post) {
    return post.id;
  });

  if (ids.length === 0) {
    return postId;
  }

  var lastPostId = Math.max.apply(Math, ids);
  postId = Number(lastPostId) + 1;

  if (!postId) {
    postId = 0;
  }

  return postId;
}


//** Add published post to posts.json **//
function addToPosts(fileName, postInfo) {

  posts.unshift(postInfo);

  fs.writeFileSync(config.blog.postsJSON, JSON.stringify(posts));
}

function renderPostStatic(postInfo) {
  var info = {post: postInfo, blog: config.blog, author: config.author};

  gulp.src(path.join(config.blog.templatesFolder, 'post.html'))
    .pipe($.fn(function(file){
      var template = file._contents.toString('utf8');
      var render = mark.up(template, info);
      file._contents = new Buffer(render, 'utf8');
      console.log(file._contents);
    }))
    .pipe($.rename({dirname: path.parse(postInfo.file).name,
                    basename: 'index', extname: '.html'}))
    .pipe(gulp.dest(config.blog.postsFolder));
}

////**** TASKS ****////


//** Parse Templates **//
gulp.task('rendertpl', function() {
  gulp.src(['*.html', '!post.html'], {cwd: '_templates/'})
    .pipe($.fn(function(file) {
      // Insert user information with markup-js
      var tpl = file._contents.toString('utf8');
      var rndr = mark.up(tpl, config);

      file._contents = new Buffer(rndr, 'utf8');

    }))
    .pipe($.newer('./', {
      ext: 'html'
    }))
    .pipe(gulp.dest('./'));
});


//** Concat and minify Vendor JS files **//
gulp.task('vendorjs', function() {
  gulp.src([
      '**/modernizr.js',
      '**/dist/jquery.js',
      '**/bootstrap.js',
      '**/marked.js',
      '**/highlight*.js',
    ], {
      cwd: 'bower_components/'
    })
    .pipe($.newer('js/vendor.min.js'))
    .pipe($.concat('vendor.min.js'))
    .pipe($.uglify())
    .pipe(gulp.dest('js'));
});


//** Concat and minify main and user JS **//
gulp.task('mainjs', function() {
  gulp.src([
      'main.js',
      '**/*.js',
      '!*.min.js',
      '!loadpost.js' //to be loaded only in post pages
    ], {
      cwd: 'js/'
    })
    .pipe($.newer('js/main.min.js'))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.concat('main.min.js'))
    .pipe($.uglify())
    .pipe(gulp.dest('js'));
});


//** Concat and minify vendor CSS **//
gulp.task('vendorcss', function() {

  gulp.src([
      '*/normalize.css',
      '**/bootstrap.css',
      '**/font-awesome.css'
    ], {
      cwd: 'bower_components/'
    })
    .pipe($.concat('vendor.min.css'))
    .pipe($.minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(gulp.dest('css'));

});


//** Concat and minify main CSS **//
gulp.task('maincss', function() {

  gulp.src([
      'main.css',
      '**/*.css',
      '!*.min.css',
    ], {
      cwd: 'css/'
    })
    .pipe($.concat('main.min.css'))
    .pipe($.minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(gulp.dest('css'));
});


//** Copy fonts to fonts folder **//
gulp.task('fonts', function() {
  gulp.src('**/fonts/**/*.{ttf,woff,woff2,eof,svg}', {
      cwd: 'bower_components'
    })
    .pipe($.flatten())
    .pipe(gulp.dest('fonts'));
});


//** Edit draft **//
gulp.task('edit-draft', function() {

  var drafts = fs.readdirSync(config.blog.draftsFolder);

  menu('SELECT DRAFT', drafts, function(n) {
    var fileToEdit = path.join(config.blog.draftsFolder, drafts[n]);
    editor(fileToEdit);
  });
});


//** Edit published **//
gulp.task('edit-pub', function() {

  var published = fs.readdirSync(config.blog.publishedFolder);

  menu('SELECT POST', published , function(n) {
    var fileToEdit = path.join(config.blog.publishedFolder, published[n]);
    editor(fileToEdit);
  });
});


//** Create post **//
gulp.task('create', function() {

  mkdir(config.blog.draftsFolder);

  var properties = [{
    name: 'title',
    validator: /^[\w\s\-,:\'\"\u00C0-\u017F]+$/,
    message: 'Post title:'.green,
    warning: 'Invalid characters',
    required: true
  }, {
    name: 'category',
    message: 'Category:'.green,
    validator: /^[A-Za-z0-9*]+$/,
    warning: 'Only one word describing the category',
    required: false,
    default: '*'
  }, {
    name: 'tags',
    message: 'Tags:'.green,
    validator: /^[a-z,-0-9]+$/,
    warning: 'Tags must be in lower case and separated only by commas'
  }, {
    name: 'description',
    message: 'Description:'.green
  }];

  var postFormat = '---\ntitle: %TITLE%\ndescription: %DESCRIPTION%'
  postFormat += 'author: %AUTHOR%\ncategory: %CATEGORY%\ntags: %TAGS%\n---';


  prompt.get(properties, function(err, answer) {

    if (err) {
      console.log(err);
      return;
    }

    var postContent = '---\n';
    postContent += 'title: ' + answer.title + '\n';
    postContent += 'id: {{id}}\n';
    postContent += 'description: ' + (answer.description || '') + '\n';
    postContent += 'author: ' + config.author.name + '\n';
    postContent += 'category: ' + answer.category + '\n';
    postContent += 'tags: ' + (answer.tags || '') + '\n';
    postContent += '---\n';

    var fileName = path.join(config.blog.draftsFolder,
                             formatFname(answer.title) + '.md');

    fs.writeFileSync(fileName, postContent);
    editor(fileName);
  });


});


//** Publish post **//
gulp.task('publish', function() {

  mkdir(config.blog.publishedFolder);

  var drafts = fs.readdirSync(config.blog.draftsFolder);

  menu('SELECT DRAFT TO PUBLISH', drafts, function(n) {

    var fileToPublish = path.join(config.blog.draftsFolder, drafts[n]);

    gulp.src(fileToPublish)
      .pipe($.fn(function(file) {
        // Insert post id
        var content = file._contents.toString('utf-8');
        var info = {
          id: genPostId()
        };

        content = mark.up(content, info);
        file._contents.write(content, 'utf-8');
      }))
      .pipe(gulp.dest(config.blog.publishedFolder));

      var postInfo = getPostInfo(fileToPublish);

      console.log(postInfo);

    // Add published post to posts.json
    addToPosts(fileToPublish, postInfo);
    // Create post.html
    renderPostStatic(postInfo);
    // Delete draft once published
    del(fileToPublish);
  });
});


//** Remove draft **//
gulp.task('remove-draft', function() {
  var draftsList = fs.readdirSync(config.blog.draftsFolder);

  menu('SELECT DRAFT TO DELETE', drafts, function(n) {
    var fileToDelete = path.join(configure.blog.draftsFolder, drafts[n]);

    inputConfirm(function() {
      del(fileToDelete);
      console.log(('Deleted ' + drafts[n]).red.bold);
    });
  });
});


//** Remove published post **//
gulp.task('remove-pub', function() {
  var published = fs.readdirSync(config.blog.publishedFolder);

  menu('SELECT POST TO DELETE', published, function(n) {
    var fileToDelete = path.join(config.blog.publishedFolder, published[n]);

    inputConfirm(function() {
      del(fileToDelete);
      console.log(('Deleted ' + publishedList[n]).red.bold);
    });
  });
});


//** Initial setup **//
gulp.task('setup', ['rendertpl', 'vendorjs', 'vendorcss', 'mainjs',
  'maincss', 'fonts'
]);


//** Build app **//
gulp.task('build', ['rendertpl', 'mainjs', 'maincss']);

gulp.task('default', ['build', 'create']);

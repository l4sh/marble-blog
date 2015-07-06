// Much improvement to be done here

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var mkdir = require('mkdir-p');
var fs = require('fs');
var colors = require('colors');
var mark = require('markup-js');

//** Prompt **//
var prompt = require('prompt');
prompt.message = '✪ '.red.bold;
prompt.delimiter = '';


//** Load Config **//
var posts = require('./posts.json');
var config = require('./config.json');
var draftsPath = config.blog.postsPath + config.blog.draftsFolder;
var publishedPath = config.blog.postsPath + config.blog.publishedFolder;


//** Run external editor **//
function editor(file) {
  child_process = require('child_process');
  var editor = config.editor || process.env.EDITOR || 'vi';

  var child = child_process.spawn(editor, [file], {
    stdio: 'inherit'
  });
};


//** Menu **//
function menu(menuTitle, menuItems, callback) {

  // Display title
  console.log('\n' + menuTitle.red.bold);
  console.log(Array(menuTitle.length + 1).join('=').magenta.bold);

  // Show list of items
  for (item in menuItems) {
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
};


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

    result = /^[y|Y]/.test(answer.confirm);

    if (callback && typeof(callback) === 'function') {
      if (result) {
        callback();
      }
    }
  });
};


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

  for (i in reChars) {
    string = string.replace(reChars[i].replace, reChars[i].plain);
  }

  return string;
};



//** Read post and get header info**//
function getPostInfo(fname, callback) {

  var data = fs.readFileSync(fname, 'utf-8');
  var data = data.split(/^---\n|\n---\n/);
  var headerData = data[1];
  var body = data[2];

  headerData = headerData.split('\n');
  var info = {};

  for (i in headerData) {

    if (headerData[i]) {
      var _t = headerData[i].split(':');
      var key = _t[0].toLowerCase().trim();
      var val = _t[1].trim();

      // Tags go to an array
      if (key === 'tags') {
        val = val.split(',');
        for (a in val) {
          val[a] = val[a].trim();
        }
      }

      info[key] = val;
    }
  }

  // Create excerpt
  var excerpt = body.split(' ').slice(0, config.blog.excerptLength);
  excerpt = excerpt.join(' ');
  info['excerpt'] = excerpt;
  

  if (callback && typeof(callback) === 'function') {
    callback(info);
  }
}


//** Get the ID of the last post **//
function genPostId() {
  var postsJSON = posts;
  var postId = 0;
  var ids = postsJSON.map(function(post) {
    return post.id;
  });

  if (ids.length === 0) {
    return postId;
  }

  var lastPostId = Math.max.apply(Math, ids);
  postId = Number(lastPostId) +1
  return postId;
}


//** Add published post to posts.json **//
function addToPosts(fname) {
  var postsJSON = posts;
  var postsJSONFile = config.blog.postsJSON;

  getPostInfo(fname, function(info) {
    // Insert post id
    info.id = genPostId(postsJSON);
    console.log(info.id);
    if (!info.id) {
      info.id = 0;
    }

    postsJSON.unshift(info);
    fs.writeFileSync(postsJSONFile, JSON.stringify(postsJSON));
  })
};

//** render markup **//
function markup(string) {
  return mark.up(string, config);
};


////**** TASKS ****////

//** Parse Templates **//
gulp.task('rendertpl', function() {
  gulp.src('tpl/*.html')
    .pipe($.newer('./', {
      ext: 'html'
    }))
//    .pipe($.haml())
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
      '!404.js' //404 should only be loaded on 404 pages
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


//** Edit post **//
gulp.task('edit', function() {

  var draftsList = fs.readdirSync(draftsPath);

  menu('SELECT DRAFT', draftsList, function(draftNumber) {
    var fileToEdit = draftsPath + '/' + draftsList[draftNumber];

    editor(fileToEdit);
  });
});


//** Create post **//
gulp.task('create', function() {
  mkdir(draftsPath);

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
  }]

  var postFormat = '---\ntitle: %TITLE%\ndescription: %DESCRIPTION%'
  postFormat += 'author: %AUTHOR%\ncategory: %CATEGORY%\ntags: %TAGS%\n---'


  prompt.get(properties, function(err, answer) {

    if (err) {
      console.log(err);
      return;
    }

    var postContent = '---\n';
    postContent += 'title: ' + answer.title + '\n';
    postContent += 'description: ' + (answer.description || '') + '\n'
    postContent += 'author: ' + config.author.name + '\n'
    postContent += 'category: ' + answer.category + '\n';
    postContent += 'tags: ' + (answer.tags || '') + '\n';
    postContent += '---\n'

    var fileName = draftsPath + '/' + formatFname(answer.title) + '.md';

    fs.writeFileSync(fileName, postContent);
    editor(fileName);
  });


})


//** Publish post **//
gulp.task('publish', function() {

  mkdir(publishedPath);

  var draftsList = fs.readdirSync(draftsPath);

  menu('SELECT DRAFT TO PUBLISH', draftsList, function(draftNumber) {

    var fileToPublish = draftsPath + '/' + draftsList[draftNumber];
    gulp.src(fileToPublish).pipe(gulp.dest(publishedPath));

    // Add published post to posts.json
    addToPosts(fileToPublish);
    // Delete draft once published
    del(fileToPublish);
  });

});


//** Remove draft **//
gulp.task('remove-draft', function() {
  var draftsList = fs.readdirSync(draftsPath);

  menu('SELECT DRAFT TO DELETE', draftsList, function(draftNumber) {
    var fileToDelete = draftsPath + '/' + draftsList[draftNumber];

    inputConfirm(function() {
      del(fileToDelete);
      console.log(('Deleted ' + draftsList[draftNumber]).red.bold);
    });
  });
});



//** Initial setup **//
gulp.task('setup', ['haml', 'vendorjs', 'vendorcss', 'mainjs',
  'maincss', 'fonts'
]);


//** Build app **//
gulp.task('build', ['rendertpl', 'mainjs', 'maincss']);

gulp.task('default', ['build', 'create']);

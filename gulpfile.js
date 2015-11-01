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
var inquirer = require('inquirer');

var marbleIcon = '⭕⭕⭕';
var marbleHeader = '  MARBLE' + marbleIcon;
marbleHeader += '\n  ' + fillChar(16, '-')


//** Prompt **//
var prompt = require('prompt');
prompt.message = marbleIcon.white.bold;
prompt.delimiter = '';


//** Load Config **//
var posts = require('./posts.json');
var config = require('./config.js');


//** Run external editor **//
function runEditor(file) {
  clearScr();
  var childProcess = require('child_process');
  var editor = config.editor || process.env.EDITOR || 'vi';

  childProcess.spawn(editor, [file], {
    stdio: 'inherit'
  });

}

//** Fill with desired characters or whitespace **//
function fillChar(length, chars) {
  chars = chars || ' ';
  return (new Array(length).join(chars)).substring(0, length);
}

function clearScr() {
  process.stdout.write("\u001b[2J\u001b[0;0H");
}


//** Menu **//
function createMenu(menuTitle, menuItems, callback) {
  clearScr()

  console.log(marbleHeader.bold.gray)

  menuItems.push(new inquirer.Separator())
  if (menuTitle !== 'Main menu') {
    menuItems.push({value: 'main-menu', name: 'Main menu'});
  }

  menuItems.push({value: 'exit', name: 'Exit'});

  inquirer.prompt(
    {
      type: 'list',
      name: 'choice',
      message: menuTitle,
      choices: menuItems
    }, function(answer) {
      if (answer.choice === 'exit') {
        clearScr();
        console.log(marbleHeader.bold.gray + '\n\n  See you later...'.magenta);
        process.exit()
      } else if (answer.choice === 'main-menu') {
        gulp.start('default');
      } else {
        if (callback && typeof(callback) === 'function') {
          callback(answer.choice);
        }
      }
    });
}


//** Confirm prompt **//
function menuConfirm(callback, question) {
  question = question || 'Are you sure';

  inquirer.prompt({
    type: 'confirm',
    name: 'confirmed',
    message: question
  }, function(answer){
    if (callback && typeof(callback) === 'function') {
        callback(answer.confirmed);
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
gulp.task('render-templates', function() {
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
gulp.task('vendor-js', function() {
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
gulp.task('main-js', function() {
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
gulp.task('vendor-css', function() {

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
gulp.task('main-css', function() {

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

  createMenu('Select draft to edit', drafts, function(fileName) {
    var fileToEdit = path.join(config.blog.draftsFolder, fileName);
    runEditor(fileToEdit);

  });
  gulp.start('edit-draft');
});


//** Edit published **//
gulp.task('edit-published', function() {
  var noPosts = 'No posts here';

  var published = fs.readdirSync(config.blog.publishedFolder);
  if (!published.length) {
    published.push(noPosts);
  }
  createMenu('Select published post to edit', published, function(fileName) {
    var fileToEdit = path.join(config.blog.publishedFolder, fileName);
    runEditor(fileToEdit);
    gulp.start('edit-published');
  });


});


//** Create post **//
gulp.task('add-draft', function() {

  mkdir(config.blog.draftsFolder);

  var questions = [
    {
      type: 'input',
      name: 'post_title',
      message: 'Post title',
      validate: function( value ) {
        if (value.match(/^[\w\s\-,:\'\"\u00C0-\u017F]+$/)) {
          return true;
        } else {
          return 'Invalid characters';
        }
      }
    },
    {
      type: 'input',
      name: 'category',
      message: 'Category',
      validate: function( value ) {
        if (value.match(/^[A-Za-z0-9*]+$|^$/)) {
          return true;
        } else {
          return 'Please use only one word describing the category';
        }
      },
      default: function () { return "*"; }
    },
    {
      type: 'input',
      name: 'tags',
      message: 'Tags',
      validate: function( value ) {
        if (value.match(/^[a-z,-0-9]+$|^$/)) {
          return true;
        } else {
          return 'Tags must be in lower case and separated only by commas';
        }
      },
      default: function () { return ''; }
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description'
    }
  ];

  inquirer.prompt( questions, function(answers) {
    var postContent = [
      '---',
      'title: ' + answers.post_title,
      'id: {{id}}',
      'description: ' + (answers.description || ''),
      'author: ' + config.author.name,
      'category: ' + answers.category,
      'tags: ' + (answers.tags || ''),
      '---'
    ];

    postContent = postContent.join('\n') + '\n';

    var fileName = path.join(config.blog.draftsFolder,
                             formatFname(answers.post_title) + '.md');

    fs.writeFileSync(fileName, postContent);
    runEditor(fileName);

    console.log('Remember to publish when you\'re ready'.green)

  });

});


//** Publish post **//
gulp.task('publish', function() {

  mkdir(config.blog.publishedFolder);

  var drafts = fs.readdirSync(config.blog.draftsFolder);

  createMenu('SELECT DRAFT TO PUBLISH', drafts, function(label, index) {

    var fileToPublish = path.join(config.blog.draftsFolder, drafts[index]);

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

    gulp.start('publish');
  }, 'green');

  console.log('start publish');
  gulp.start('publish');
});


//** Remove draft **//
gulp.task('delete-draft', function() {
  var draftsList = fs.readdirSync(config.blog.draftsFolder);

  createMenu('SELECT DRAFT TO DELETE', draftsList, function(fileName) {
    var fileToDelete = path.join(config.blog.draftsFolder, fileName);

    menuConfirm(function() {
      del(fileToDelete);
      console.log(('Deleted ' + fileName).red.bold);
    });
  }, 'red');
  gulp.start('delete-draft');
});


//** Remove published post **//
gulp.task('delete-published', function() {
  var published = fs.readdirSync(config.blog.publishedFolder);

  createMenu('Select post to delete (Published)', published, function(n) {
    var fileToDelete = path.join(config.blog.publishedFolder, published[n]);

    menuConfirm(function() {
      del(fileToDelete);
      console.log(('Deleted ' + publishedList[n]).red.bold);
    });
  }, 'red');

  gulp.start('delete-published');
});


//** Initial setup **//
gulp.task('build', ['vendor-js', 'vendor-css', 'main-js', 'main-css',
                    'install-fonts', 'render-templates',], function(){

  disableRaw();
});


//** Default **//
gulp.task('default', function() {
  var tasks = [
    {value: 'build', name: 'Build blog (Minify JS/CSS, render templates, etc.)'},
    {value: 'add-draft', name: 'Add a new post (as draft)'},
    {value: 'publish', name: 'Publish draft'},
    {value: 'edit-draft', name: 'Edit draft'},
    {value: 'edit-published', name: 'Edit published post'},
    {value: 'delete-draft', name: 'Delete draft'},
    {value: 'delete-published', name: 'Delete published post'},
  ]
  createMenu('Main menu', tasks, function(answer){
    gulp.start(answer);
  })
});

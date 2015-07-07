function loadContent() {
  var url = window.location.href;
  url = url.split('/');
  url = url[url.length - 1];
  // Check if post file exists
  if (JSON.stringify(posts).indexOf(url + '.md') > 0) {
    // and update the url, title and body
    var title = config.title + ' - ' + url.replace(/_/g, ' ');
    document.title = title;
    $('body').load('index.html')
  }
};

(function() {
  loadContent();
})();

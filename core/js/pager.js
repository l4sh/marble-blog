//** LOAD PAGER **//

function loadPager(position) {
  var pagerLeft, pagerRight;

  switch(config.blog.pagerStyle) {
    case 'icons':
      pagerLeft = '<i class="glyphicon glyphicon-menu-left"></i>';
      pagerRight = '<i class="glyphicon glyphicon-menu-right"></i>';
      break;

    case 'text':
      pagerLeft = 'Newer';
      pagerRight = 'Older';
      break;

  }
  var pagerHTML = '<nav><ul class="pager"><li><a class="pager-previous" href="#">';
  pagerHTML += pagerLeft + '</a></li><li><a class="pager-next" href="#">';
  pagerHTML += pagerRight + '</a></li></ul></nav>';

  switch(position) {
    case 'top':
      $('.pager-top').html(pagerHTML);
      break;

    case 'bottom':
      $('.pager-bottom').html(pagerHTML);
      break;

    case 'both':
      $('.pager-top').html(pagerHTML);
      $('.pager-bottom').html(pagerHTML);
      break;

  }

}


//** Load pager on page load **//
$(function(){

  if (typeof isPost === 'undefined') {
    loadPager(config.blog.pagerPosition);

    // Watch pager clicks and load previous/next page
    $('.pager').on('click', '.pager-previous', function() {
      curPos = curPos - (ppp * 2);
      if (curPos < 0) {
        curPos = 0;
      }
      loadMultiplePosts();
    });
    $('.pager').on('click', '.pager-next', function() {
      loadMultiplePosts();
    });
  }
});

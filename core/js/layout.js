//** Set the layout dynamically **//

function makeColumns() {
  var columns = config.layout.columns.amount;
  var mainColumn = config.layout.columns.main;
  var columnSizes = config.layout.columns.sizes;

  for (var i=1; i <= columns; i++) {
    var div = '<div id="col-{{id}}" class="col-md-{{size}}"></div>';
    div = div.replace('{{size}}', columnSizes[i - 1]);

    if (mainColumn < i) {
      div = div.replace('{{id}}', i);
      $('#col-content').after(div);
    } else if (mainColumn > i) {
      div = div.replace('{{id}}', i);
      $('#col-content').before(div);
    } else {
      $('#col-content').removeClass('col-md-12').addClass('col-md-' + columnSizes[i - 1]);
    }
  }
}

function setExtraRows() {
  var divTop = '<div id="row-content-top"></div>';
  var divBottom = '<div id="row-content-bottom"></div>';

  switch(config.layout.extraRows) {
    case 'both':
      $('#col-content').prepend(divTop);
      $('#col-content').append(divBottom);
      break;
    case 'top':
      $('#col-content').prepend(divTop);
      break;
    case 'bottom':
      $('#col-content').append(divBottom);
      break;
  }
}


function setCopyright() {
  var licenseText = config.layout.footer.licenseText;
  licenseText = licenseText.replace('{{author}}', config.author.name);
  licenseText = licenseText.replace('{{year}}', new Date().getFullYear());
  $('#footer-content').prepend(licenseText);
}

function poweredBy() {
  if (!config.layout.footer.poweredBy) {
    $('#powered-by').remove();
  }
}

$(function() {
  makeColumns();
  poweredBy();
  setCopyright();
  setExtraRows();
});

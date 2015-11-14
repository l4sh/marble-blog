//**** MISCELLANEOUS FUNCTIONS ****//

//** Parse date **//
function parseDate(dateStr) {

  var date = new Date(dateStr);
  date = date.toLocaleString();

  return date;
}

//** Join paths **//
function pathJoin() {
  return Array.slice(arguments).join('/');
}

//** Get array and object size **//
function size(iter) {

  var _s = $.map(iter, function(n, i) {
    return i;
  }).length;

  return _s;
}

// @type concolic-replay
// @target es5 Array.prototype.forEach
// @feature builtin forEach
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  var s = ''; symbolic.forEach(function (x) { s += x; });
  // @witness S$.symbol("s", ["a","b"])
  if (s === 'ab') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["x","y"]));

// @type concolic-replay
// @target es5 Array.prototype.forEach
// @feature builtin forEach
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  var m = 0; symbolic.forEach(function (x) { if (x > m) m = x; });
  // @witness S$.symbol("s", [9,2])
  if (m === 9) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));

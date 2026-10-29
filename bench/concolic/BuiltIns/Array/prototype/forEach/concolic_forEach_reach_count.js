// @type concolic-replay
// @target es5 Array.prototype.forEach
// @feature builtin forEach
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  var c = 0; symbolic.forEach(function (x) { if (x > 5) c++; });
  // @witness S$.symbol("s", [6,7])
  if (c === 2) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));

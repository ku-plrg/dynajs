// @type concolic-replay
// @target es5 Array.prototype.forEach
// @feature builtin forEach
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  var hit = -1; symbolic.forEach(function (x, i) { if (x === 9) hit = i; });
  // @witness S$.symbol("s", [1,9])
  if (hit === 1) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));

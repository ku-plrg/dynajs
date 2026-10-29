// @type concolic-replay
// @target es5 Array.prototype.filter
// @feature builtin filter
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [1,7])
  if (symbolic.filter(function (x) { return x > 5; })[0] === 7) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));

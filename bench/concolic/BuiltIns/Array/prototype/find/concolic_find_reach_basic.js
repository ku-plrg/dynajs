// @type concolic-replay
// @target es6+ Array.prototype.find
// @feature builtin find
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [9,2])
  if (symbolic.find(function (x) { return x > 5; }) === 9) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));

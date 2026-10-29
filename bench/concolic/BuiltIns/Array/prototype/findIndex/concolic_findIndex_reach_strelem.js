// @type concolic-replay
// @target es6+ Array.prototype.findIndex
// @feature builtin findIndex
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", ["a","q"])
  if (symbolic.findIndex(function (x) { return x === 'q'; }) === 1) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["a","b"]));

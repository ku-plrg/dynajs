// @type concolic-replay
// @target es6+ Array.prototype.findLast
// @feature builtin findLast
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", ["z","a"])
  if (symbolic.findLast(function (x) { return x !== 'a'; }) === 'z') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["a","b"]));

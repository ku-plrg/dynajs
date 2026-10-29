// @type concolic-replay
// @target es6+ Array.prototype.find
// @feature builtin find
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", ["a","z"])
  if (symbolic.find(function (x) { return x !== 'a'; }) === 'z') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["a","b"]));

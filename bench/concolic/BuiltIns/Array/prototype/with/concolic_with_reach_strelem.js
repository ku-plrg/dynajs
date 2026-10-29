// @type concolic-replay
// @target es6+ Array.prototype.with
// @feature builtin with
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", ["a","z"])
  if (symbolic.with(0, 'a')[1] === 'z') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["a","b"]));

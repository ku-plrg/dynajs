// @type concolic-replay
// @target es6+ String.prototype.padStart
// @feature builtin padStart
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "ab")
  if (symbolic.padStart(3) === ' ab') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));

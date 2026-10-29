// @type concolic-replay
// @target es6+ String.prototype.padEnd
// @feature builtin padEnd
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "ab")
  if (symbolic.padEnd(4, '*') === 'ab**') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));

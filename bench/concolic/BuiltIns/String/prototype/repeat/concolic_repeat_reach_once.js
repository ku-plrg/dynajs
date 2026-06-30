// @type concolic-replay
// @target es6+ String.prototype.repeat
// @feature builtin repeat
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "ab")
  if (symbolic.repeat(1) === 'ab') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));

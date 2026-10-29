// @type concolic-replay
// @target es5 String.prototype.small
// @feature builtin small
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "zbc")
  if (symbolic.small()[7] === 'z') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));

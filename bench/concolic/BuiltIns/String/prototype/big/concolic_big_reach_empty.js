// @type concolic-replay
// @target es5 String.prototype.big
// @feature builtin big
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "")
  if (symbolic.big() === '<big></big>') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "a"));

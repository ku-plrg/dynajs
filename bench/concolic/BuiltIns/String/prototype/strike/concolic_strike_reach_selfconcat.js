// @type concolic-replay
// @target es5 String.prototype.strike
// @feature builtin strike
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "q")
  if (symbolic.strike() + symbolic === '<strike>q</strike>q') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "a"));

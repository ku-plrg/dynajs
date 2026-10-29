// @type concolic-replay
// @target es5 String.prototype.bold
// @feature builtin bold
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "q")
  if (symbolic.bold() + symbolic === '<b>q</b>q') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "a"));

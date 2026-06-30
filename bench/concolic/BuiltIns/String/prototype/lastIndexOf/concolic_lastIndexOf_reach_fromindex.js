// @type concolic-replay
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "ab")
  if (symbolic.lastIndexOf('b', 0) === -1) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "ba"));

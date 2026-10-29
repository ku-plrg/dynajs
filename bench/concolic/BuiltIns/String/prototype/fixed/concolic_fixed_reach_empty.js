// @type concolic-replay
// @target es5 String.prototype.fixed
// @feature builtin fixed
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "")
  if (symbolic.fixed() === '<tt></tt>') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "a"));

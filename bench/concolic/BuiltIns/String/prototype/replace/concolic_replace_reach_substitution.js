// @type concolic-replay
// @target es5 String.prototype.replace
// @feature builtin replace
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "ab")
  if (symbolic.replace('a', '[$&]') === '[a]b') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "xb"));

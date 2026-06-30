// @type concolic-replay
// @target es5 String.prototype.substr
// @feature builtin substr
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "axxde")
  if (symbolic.substr(1, 2) !== 'bc') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abcde"));

// @type concolic-replay
// @target es5 String.prototype.toLowerCase
// @feature builtin toLowerCase
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "ABC")
  if (symbolic.toLowerCase() === 'abc' && symbolic !== 'abc') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));

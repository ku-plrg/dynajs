// @type concolic-replay
// @target es5 String.prototype.fontcolor
// @feature builtin fontcolor
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "abc")
  if (symbolic.fontcolor('x').length === 26) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "ab"));

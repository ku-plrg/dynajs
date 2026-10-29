// @type concolic-replay
// @target es5 String.prototype.anchor
// @feature builtin anchor
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "abc")
  if (symbolic.anchor('x').length === 19) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "ab"));

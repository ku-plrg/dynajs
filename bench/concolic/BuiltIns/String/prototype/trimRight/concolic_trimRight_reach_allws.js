// @type concolic-replay
// @target es5 String.prototype.trimRight
// @feature builtin trimRight
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "   ")
  if (symbolic.trimRight() === '') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc  "));

// @type concolic-replay
// @target es5 String.prototype.trimLeft
// @feature builtin trimLeft
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "  abc")
  if (symbolic.trimLeft().length === 3) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "  ab"));

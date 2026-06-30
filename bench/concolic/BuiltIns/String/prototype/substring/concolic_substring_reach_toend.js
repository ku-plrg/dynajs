// @type concolic-replay
// @target es5 String.prototype.substring
// @feature builtin substring
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "abcd")
  if (symbolic.substring(1) === 'bcd') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));

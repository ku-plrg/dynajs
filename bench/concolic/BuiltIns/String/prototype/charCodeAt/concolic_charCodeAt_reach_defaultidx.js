// @type concolic-replay
// @target es5 String.prototype.charCodeAt
// @feature builtin charCodeAt
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "xbc")
  if (symbolic.charCodeAt() === 120) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));

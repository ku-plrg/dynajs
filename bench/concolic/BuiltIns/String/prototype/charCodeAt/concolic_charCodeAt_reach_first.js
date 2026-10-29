// @type concolic-replay
// @target es5 String.prototype.charCodeAt
// @feature builtin charCodeAt
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "Abc")
  if (symbolic.charCodeAt(0) === 65) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));

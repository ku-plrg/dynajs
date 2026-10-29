// @type concolic-replay
// @target es5 Array.prototype.sort
// @feature builtin sort
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  symbolic.sort();
  // @witness S$.symbol("s", ["c","a"])
  if (symbolic[0] === 'a') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["c","b"]));

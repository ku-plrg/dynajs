// @type concolic-replay
// @target es5 Array.prototype.push
// @feature builtin push
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  symbolic.push(5);
  // @witness S$.symbol("s", [])
  if (symbolic[0] === 5) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [7]));

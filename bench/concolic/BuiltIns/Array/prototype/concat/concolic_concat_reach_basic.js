// @type concolic-replay
// @target es5 Array.prototype.concat
// @feature builtin concat
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [1,9])
  if (symbolic.concat([3])[1] === 9) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));

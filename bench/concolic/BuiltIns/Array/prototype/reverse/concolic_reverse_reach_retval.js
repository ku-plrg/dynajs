// @type concolic-replay
// @target es5 Array.prototype.reverse
// @feature builtin reverse
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", [9,2])
  if (symbolic.reverse()[1] === 9) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1,2]));

// @type concolic-replay
// @target es5 Array.prototype.push
// @feature builtin push
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  var r = symbolic.push(9);
  // @witness S$.symbol("s", [1,2])
  if (r === 3) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [1]));

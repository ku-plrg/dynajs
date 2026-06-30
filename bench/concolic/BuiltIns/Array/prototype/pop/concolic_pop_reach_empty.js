// @type concolic-replay
// @target es5 Array.prototype.pop
// @feature builtin pop
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  var r = symbolic.pop();
  // @witness S$.symbol("s", [])
  if (r === undefined) {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", [7]));

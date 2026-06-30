// @type concolic-replay
// @target es5 Array.prototype.join
// @feature builtin join
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", ["a","b"])
  if (symbolic.join("") === "ab") {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", ["a"]));

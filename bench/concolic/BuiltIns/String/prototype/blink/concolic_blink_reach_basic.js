// @type concolic-replay
// @target es5 String.prototype.blink
// @feature builtin blink
// @reach true

"use strict";
var S$ = require("S$");

function __test_symbolic__(symbolic) {

  // @witness S$.symbol("s", "hi")
  if (symbolic.blink() === '<blink>hi</blink>') {
    throw "Reachable";
  }

}

__test_symbolic__(S$.symbol("s", "abc"));

// @type concolic
// @target es5 Object.isFrozen
// @feature builtin isfrozen

function __test_symbolic__(symbolic) {
  var o = Object.freeze({ x: symbolic });
  if (symbolic > 0) {
    // @witness o was frozen, so isFrozen must report true and its negation is impossible
    __IS_SAT__(!Object.isFrozen(o), false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 5));

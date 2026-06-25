// @type concolic
// @target es5 Object.isFrozen
// @feature builtin isfrozen

function __test_symbolic__(symbolic) {
  Object.freeze(symbolic);
  if (Object.isFrozen(symbolic)) {
    // @witness symbolic was frozen, so isFrozen reports true and its negation cannot hold
    __IS_SAT__(!Object.isFrozen(symbolic), false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', { x: 1 }));

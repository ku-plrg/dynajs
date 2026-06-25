// @type concolic
// @target es6+ Array.prototype.flat
// @feature builtin flat
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var r = symbolic.flat();
    // @witness flat on an already-flat array copies every element, preserving length 2
    __IS_SAT__(r.length !== 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));

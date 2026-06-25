// @type concolic
// @target es6+ Array.from
// @feature builtin from

function __test_symbolic__(symbolic) {
  if (Array.from(symbolic).length === 2) {
    // @witness Array.from copies every element, so a copy of length 2 forces the source length to 2
    __IS_SAT__(symbolic.length !== 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));

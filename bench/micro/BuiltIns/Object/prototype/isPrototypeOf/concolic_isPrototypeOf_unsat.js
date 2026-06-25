// @type concolic
// @target es5 Object.prototype.isPrototypeOf
// @feature builtin isprototypeof

function __test_symbolic__(symbolic) {
  var base = {};
  var derived = Object.create(base);
  if (symbolic > 0) {
    // @witness derived is created from base, so base is always in its prototype chain
    __IS_SAT__(!base.isPrototypeOf(derived), false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 5));

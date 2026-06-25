// @type concolic
// @target es5 Object.prototype.isPrototypeOf
// @feature builtin isprototypeof

function __test_symbolic__(symbolic) {
  var base = {};
  var o = symbolic > 0 ? Object.create(base) : {};
  if (base.isPrototypeOf(o)) {
    // @witness base is o's prototype only on the symbolic > 0 branch (where o is created from base), so symbolic <= 0 is impossible
    __IS_SAT__(symbolic <= 0, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 5));

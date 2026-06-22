// @type concolic
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// @done


function __test_symbolic__(symbolic) {

    // @winess __test_symbolic__('baa')
  __symbolic_assert__(symbolic.lastIndexOf('b') === 2, false);

}

__test_symbolic__(__symbolic__('s', "aab"));

// @type concolic
// @target es5 Object.prototype.hasOwnProperty
// @feature builtin hasownproperty

function __test_symbolic__(symbolic) {
  var o = { a: 1 };
  // @witness __test_symbolic__("a")
  __IS_SAT__(o.hasOwnProperty(symbolic), true);
}

__test_symbolic__(__symbolic__('s', "z"));

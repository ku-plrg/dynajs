// @type concolic
// @target es5 Object.prototype.hasOwnProperty
// @feature builtin hasownproperty

function __test_symbolic__(symbolic) {
  var o = { a: 1 };
  if (o.hasOwnProperty(symbolic)) {
    // @witness o owns only "a" (value 1), so hasOwnProperty(symbolic) forces o[symbolic] to be 1
    __IS_SAT__(o[symbolic] !== 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', "a"));

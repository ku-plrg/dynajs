// @type concolic
// @target es5 Object.prototype.propertyIsEnumerable
// @feature builtin propertyisenumerable

function __test_symbolic__(symbolic) {
  var o = {};
  Object.defineProperty(o, "hidden", { value: 1, enumerable: false });
  if (symbolic.length >= 1) {
    // @witness "hidden" is defined non-enumerable, so propertyIsEnumerable can never report it true
    __IS_SAT__(o.propertyIsEnumerable("hidden"), false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', "abc"));

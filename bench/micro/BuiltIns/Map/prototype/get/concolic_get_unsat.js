// @type concolic
// @target es6+ Map.prototype.get
// @feature builtin get

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set("a", 1);
  if (m.get(symbolic) === 1) {
    // @witness 1 is stored only under key "a", so get(symbolic) === 1 forces symbolic to be "a"
    __IS_SAT__(symbolic !== "a", false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', "a"));

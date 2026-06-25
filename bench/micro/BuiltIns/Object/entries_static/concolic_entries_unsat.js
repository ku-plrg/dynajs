// @type concolic
// @target es6+ Object.entries
// @feature builtin entries

function __test_symbolic__(symbolic) {
  var o = { a: 1 };
  if (symbolic.length >= 1) {
    var e = Object.entries(o);
    // @witness o's only key is "a", so the first entry's key cannot differ from "a"
    __IS_SAT__(e[0][0] !== "a", false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', "x"));

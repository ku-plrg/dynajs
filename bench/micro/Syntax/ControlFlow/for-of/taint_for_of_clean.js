// @type taint
// @target es6+ for-of
// @feature syntax for-of

function __test_taint__(tainted) {
    var to_clean = ["a", "b"];
    var to_last;
    for (var to_w of to_clean) {
      to_last = to_w;
    }
    __assert_taint__(to_last, false);
}

__test_taint__(__set_taint__("x"));

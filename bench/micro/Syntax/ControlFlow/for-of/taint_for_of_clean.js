// @type taint
// @target es6+ for-of
// @feature syntax for-of
// @done

function __test_taint__(tainted) {
    var to_clean = ["a", "b", "c"];
    var to_last;
    for (var to_w of to_clean) {
      to_last = to_w;
    }
    // @witness always "c"
    __assert_taint__(to_last, false);
}

__test_taint__(__set_taint__("tv"));

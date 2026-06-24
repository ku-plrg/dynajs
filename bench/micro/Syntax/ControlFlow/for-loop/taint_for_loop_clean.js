// @type taint
// @target es5 for-loop
// @feature syntax for-loop
// @done

function __test_taint__(tainted) {
    var tf_clean = "";
    for (var tf_j = 0; tf_j < 3; tf_j++) {
      tf_clean = tf_clean + "clean";
    }
    // @witness always "cleancleanclean"
    __assert_taint__(tf_clean, false);
}

__test_taint__(__set_taint__("tv"));

// @type taint
// @target es5 for-in
// @feature syntax for-in
// @done

function __test_taint__(tainted) {
    var ti_keyed = { secret: tainted };
    var ti_seen;
    for (var ti_k in ti_keyed) {
      ti_seen = ti_k;
    }
    // @witness always "secret"
    __assert_taint__(ti_seen, false);
}

__test_taint__(__set_taint__("tv"));

// @type taint
// @target es6+ computed-property
// @feature syntax computed-property
// @done

function __test_taint__(tainted) {
    var tcp_key = "k";
    var tcp_obj = { [tcp_key]: tainted };
    // @witness __test_taint__('x') => obj[tcp_key] = 'x' tainted (tainted is the VALUE, not the key)
    __assert_taint__(tcp_obj["k"], true);
}

__test_taint__(__set_taint__("tv"));

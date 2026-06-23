// @type taint
// @target es6+ computed-property
// @feature syntax computed-property

function __test_taint__(tainted) {
    var tcp_key = "k";
    var tcp_obj = { [tcp_key]: tainted };
    __assert_taint__(tcp_obj["k"], true);
}

__test_taint__(__set_taint__("tv"));

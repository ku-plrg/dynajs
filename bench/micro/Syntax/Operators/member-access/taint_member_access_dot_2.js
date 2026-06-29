// @type taint
// @target es5 member-access
// @feature syntax member-access

function __test_taint__(tainted) {
    var tm_obj = { f: tainted };
    // @witness __test_taint__('x') => obj['f'] = 'x' tainted
    __assert_taint__(tm_obj["f"], true);
}

__test_taint__(__set_taint__("tv"));

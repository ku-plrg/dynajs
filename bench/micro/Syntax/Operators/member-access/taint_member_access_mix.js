// @type taint
// @target es5 member-access
// @feature syntax member-access

function __test_taint__(tainted) {
    var tm_o2 = { tainted: tainted, clean: "x" };
    // @witness property 'clean' holds a plain string, not the tainted value => clean
    __assert_taint__(tm_o2.clean, false);
}

__test_taint__(__set_taint__("tv"));

// @type taint
// @target es5 array-literal
// @feature syntax array-literal
// @done

function __test_taint__(tainted) {
    var tal_nested = [["a", tainted]];
    // @witness tal_nested[0][0] is always 'a' clean
    __assert_taint__(tal_nested[0][0], false);
}

__test_taint__(__set_taint__("tv"));

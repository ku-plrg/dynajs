// @type taint
// @target es6+ Object.entries
// @feature builtin entries

function __test_taint__(tainted) {
    var e = Object.entries({p: tainted})[0];
    // @witness always e[0] = 'p', clean
    __assert_taint__(e[0], false);
    // @witness __test_taint__('hello') => e[1] = 'hello' tainted
    __assert_taint__(e[1], true);
}

__test_taint__(__set_taint__('hello'));

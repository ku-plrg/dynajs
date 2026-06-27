// @type taint
// @target es5 Object.keys
// @feature builtin keys

function __test_taint__(tainted) {
    var o = {};
    o[tainted] = 'v';
    // @witness __test_taint__('x') => Object.keys(o)[0] = 'x' tainted
    __assert_taint__(Object.keys(o)[0], true);

    // @witness always Object.keys({p:'v'})[0] = 'p', clean
    __assert_taint__(Object.keys({p: 'v'})[0], false);
}

__test_taint__(__set_taint__('hello'));

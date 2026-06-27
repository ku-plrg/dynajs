// @type taint
// @target es5 Object.getOwnPropertyNames
// @feature builtin getOwnPropertyNames

function __test_taint__(tainted) {
    var o = {};
    o[tainted] = 'v';
    // @witness __test_taint__('x') => Object.getOwnPropertyNames(o)[0] = 'x' tainted
    __assert_taint__(Object.getOwnPropertyNames(o)[0], true);

    // @witness always Object.getOwnPropertyNames({p:'v'})[0] = 'p', clean
    __assert_taint__(Object.getOwnPropertyNames({p: 'v'})[0], false);
}

__test_taint__(__set_taint__('hello'));

// @type taint
// @target es5 Object.getOwnPropertyNames
// @feature builtin getOwnPropertyNames

function __test_taint__(tainted) {
    var o = {};
    o[tainted] = 'v';
    // @witness __test_taint__('hello') => getOwnPropertyNames(o)[0]='hello' (tainted key)
    __assert_taint__(Object.getOwnPropertyNames(o)[0], true);

    // @witness always getOwnPropertyNames({p:'v'})[0]='p' (clean key)
    __assert_taint__(Object.getOwnPropertyNames({p: 'v'})[0], false);
}

__test_taint__(__set_taint__('hello'));

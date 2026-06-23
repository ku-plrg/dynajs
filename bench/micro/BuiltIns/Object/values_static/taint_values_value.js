// @type taint
// @target es2017 Object.values
// @feature builtin values

function __test_taint__(tainted) {
    var r = Object.values({p: tainted});
    // @witness __test_taint__('hello') => Object.values({p:tainted})[0]='hello'
    __assert_taint__(r[0], true);

    // @witness always Object.values({p:'c'})[0]='c' (clean value)
    __assert_taint__(Object.values({p: 'c'})[0], false);
}

__test_taint__(__set_taint__('hello'));

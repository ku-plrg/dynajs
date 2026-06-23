// @type taint
// @target es5 Object.create
// @feature builtin create

function __test_taint__(tainted) {
    var proto = {p: tainted};
    var r = Object.create(proto);
    // @witness __test_taint__('hello') => r.p inherited from proto is tainted
    __assert_taint__(r.p, true);

    // @witness always Object.create({p:'c'}).p='c' (clean inherited)
    __assert_taint__(Object.create({p: 'c'}).p, false);
}

__test_taint__(__set_taint__('hello'));

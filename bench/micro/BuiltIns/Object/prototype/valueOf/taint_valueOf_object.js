// @type taint
// @target es5 Object.prototype.valueOf
// @feature builtin valueOf

function __test_taint__(tainted) {
    // tainted is a tainted-CONTAINER object (the whole object is the source)
    // @witness __test_taint__({}) => tainted = {} tainted
    __assert_taint__(tainted, true);
    // @witness __test_taint__({}) => tainted.valueOf() = {} tainted
    __assert_taint__(tainted.valueOf(), true);
    tainted.p = 'clean';
    // @witness tainted.p = 'clean', assigned clean property, clean
    __assert_taint__(tainted.p, false);
}

__test_taint__(__set_taint__({}));

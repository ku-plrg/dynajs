// @type taint
// @target es5 Object.prototype.valueOf
// @feature builtin valueOf

function __test_taint__(tainted) {
    // tainted is a tainted-CONTAINER object (the whole object is the source)
    // @witness whole object tainted => container is tainted
    __assert_taint__(tainted, true);
    // @witness valueOf returns the same (tainted) object
    __assert_taint__(tainted.valueOf(), true);
    tainted.p = 'clean';
    // @witness assigned clean property is clean (container taint != property taint)
    __assert_taint__(tainted.p, false);
}

__test_taint__(__set_taint__({}));

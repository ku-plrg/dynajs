// @type taint
// @target es6 Set.prototype.add
// @feature builtin add

function __test_taint__(tainted) {
    // tainted is a tainted-CONTAINER Set (the whole set is the source)
    // @witness whole set tainted => container is tainted
    __assert_taint__(tainted, true);
    tainted.add('clean');
    // @witness still tainted after adding onto a tainted-container set
    __assert_taint__(tainted, true);
    // @witness added clean element is clean (container taint != element taint)
    __assert_taint__(Array.from(tainted)[0], false);
}

__test_taint__(__set_taint__(new Set()));

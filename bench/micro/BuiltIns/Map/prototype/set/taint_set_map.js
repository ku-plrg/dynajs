// @type taint
// @target es6+ Map.prototype.set
// @feature builtin set

function __test_taint__(tainted) {
    // tainted is a tainted-CONTAINER Map (the whole map is the source)
    // @witness whole map tainted => container is tainted
    __assert_taint__(tainted, true);
    tainted.set('k', 'clean');
    // @witness still tainted after setting onto a tainted-container map
    __assert_taint__(tainted, true);
    // @witness stored clean value is clean (container taint != element taint)
    __assert_taint__(tainted.get('k'), false);
}

__test_taint__(__set_taint__(new Map()));

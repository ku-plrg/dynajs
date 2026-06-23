// @type taint
// @target es6+ Array.prototype.copyWithin
// @feature builtin array-copyWithin
// @done

function __test_taint__(tainted) {
    
    var r = ["a", "b", "c", "d"].copyWithin(tainted, 2);
    // @witness tainted target index does not taint copied elements
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__(0));

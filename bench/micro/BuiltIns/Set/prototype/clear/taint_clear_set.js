// @type taint
// @target es6+ Set.prototype.clear
// @feature builtin set-clear
// @done

function __test_taint__(tainted) {

    var r = tainted.clear();
    // @witness always s.clear() returns undefined => clean
    __assert_taint__(r, false);


    // @witness tainted.clear() clears the set, so the set is now clean
    __assert_taint__(tainted, false);
}

__test_taint__(__set_taint__(new Set(["a", "b"])));

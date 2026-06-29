// @type taint
// @target es6+ Array.prototype.at
// @feature builtin array-at
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    // @witness tainted index retrieves a clean element => clean
    __assert_taint__(a.at(tainted), false);
}

__test_taint__(__set_taint__(0));

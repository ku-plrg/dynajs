// @type taint
// @target es6+ Array.prototype.at
// @feature builtin array-at
// @done

function __test_taint__(tainted) {
    // @witness always tainted.at(tainted.length) = undefined (OOB), clean
    __assert_taint__(tainted.at(tainted.length), false);
}

__test_taint__(__set_taint__(["a", "b", "c"]));

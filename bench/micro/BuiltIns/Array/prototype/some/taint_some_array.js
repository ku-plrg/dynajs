// @type taint
// @target es5 Array.prototype.some
// @feature builtin array-some
// @done

function __test_taint__(tainted) {
    var r = tainted.some(function() { return true; });
    // @witness always a.some(()=>true) returns boolean => clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(["a", "b", "c"]));

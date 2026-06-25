// @type taint
// @target es6+ Array.prototype.find
// @feature builtin array-find
// @done

function __test_taint__(tainted) {
    // @witness always clean values 
    __assert_taint__(tainted.find(function(v) { return v === "clean"; }), false);
    // @witness always tainted.find(() => false) = undefined (not-found), clean
    __assert_taint__(tainted.find(function() { return false; }), false);
}

__test_taint__(__set_taint__(["a", "b", "c"]));

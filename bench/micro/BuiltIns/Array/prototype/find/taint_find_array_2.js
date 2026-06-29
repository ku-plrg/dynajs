// @type taint
// @target es6+ Array.prototype.find
// @feature builtin array-find
// @done

function __test_taint__(tainted) {
    // @witness always clean values 
    __assert_taint__(tainted.find(function(v) { return v === "clean"; }), false);
}

__test_taint__(__set_taint__(["a", "b", "c"]));

// @type taint
// @target es6+ Array.prototype.find
// @feature builtin array-find
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness always 'b' clean element returned
    __assert_taint__(a.find(function (v) { return v === "b"; }), false);
}

__test_taint__(__set_taint__("hello"));

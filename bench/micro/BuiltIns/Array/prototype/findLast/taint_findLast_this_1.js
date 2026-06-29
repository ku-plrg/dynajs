// @type taint
// @target es6+ Array.prototype.findLast
// @feature builtin array-findLast
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", tainted];
    // @witness always 'b' clean element returned
    __assert_taint__(a.findLast(function (v) { return v === "b"; }), false);
}

__test_taint__(__set_taint__("hello"));

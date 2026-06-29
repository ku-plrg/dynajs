// @type taint
// @target es6+ Array.prototype.push
// @feature builtin array-push
// @done

function __test_taint__(tainted) {
    var a = ["a", "b"];
    var len = a.push(tainted);
    // @witness push returns a length (number), clean
    __assert_taint__(len, false);
}

__test_taint__(__set_taint__("hello"));

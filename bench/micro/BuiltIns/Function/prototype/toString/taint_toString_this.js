// @type taint
// @target es5 Function.prototype.toString
// @feature builtin toString

function __test_taint__(tainted) {
    // tainted is bound as arg but toString() returns source code, not data
    var id = function(x) { return x; };
    var bound = id.bind(null, tainted);
    var r = bound.toString();

    // @witness source-code string is structural; tainted data does not flow into it
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__('hello'));

// @type taint
// @target es5 Function.prototype.call
// @feature builtin call

function __test_taint__(tainted) {
    // Object.prototype.toString.call(tainted) => "[object String]" — structural, not data content
    var r = Object.prototype.toString.call(tainted);

    // @witness always r='[object String]' regardless of tainted value
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__('hello'));

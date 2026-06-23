// @type taint
// @target es5 RegExp.prototype.test
// @feature builtin test

function __test_taint__(tainted) {
    var str = 'a' + tainted + 'c';

    // @witness always /b/.test(...) returns boolean
    __assert_taint__(/b/.test(str), false);

    // @witness always /a/.test(...) returns boolean (clean prefix region)
    __assert_taint__(/a/.test(str), false);
}

__test_taint__(__set_taint__('b'));

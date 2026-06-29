// @type taint
// @target es5 String.prototype.replace
// @feature builtin replace
// @done

function __test_taint__(tainted) {
    var x = tainted + 'oobar';
    var r = x.replace('bar', 'XYZ');

    // @witness __test_taint__('x') => r[0]='x'
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__('f'));

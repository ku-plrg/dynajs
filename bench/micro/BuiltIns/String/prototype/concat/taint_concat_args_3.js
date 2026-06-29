// @type taint
// @target es5 String.prototype.concat
// @feature builtin concat
// @done

function __test_taint__(tainted) {
    var base = 'ab';
    var r = base.concat(tainted, 'Y');

    // @witness __test_taint__('x') => r[2]='x' (tainted arg)
    __assert_taint__(r[2], true);
}

__test_taint__(__set_taint__('hello'));

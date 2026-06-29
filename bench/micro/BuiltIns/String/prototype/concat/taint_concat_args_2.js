// @type taint
// @target es5 String.prototype.concat
// @feature builtin concat
// @done

function __test_taint__(tainted) {
    var base = 'ab';
    var r = base.concat(tainted, 'Y');

    // @witness always r[1]='b' (clean receiver)
    __assert_taint__(r[1], false);
}

__test_taint__(__set_taint__('hello'));

// @type taint
// @target es5 String.prototype.concat
// @feature builtin concat
// @done

function __test_taint__(tainted) {
    var base = 'ab';
    var r = base.concat(tainted, 'Y');

    // @witness always r[r.length-1]='Y' (clean suffix)
    __assert_taint__(r[r.length - 1], false);
}

__test_taint__(__set_taint__('hello'));

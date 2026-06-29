// @type taint
// @target es5 String.prototype.replace
// @feature builtin replace
// @done

function __test_taint__(tainted) {
    var x = 'abc';

    var r = x.replace('b', tainted);

    // @witness always r[0]='a' from clean receiver
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__('YZ'));

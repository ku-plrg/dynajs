// @type taint
// @target es5 String.prototype.replace
// @feature builtin replace
// @done

function __test_taint__(tainted) {
    var x = 'hello world';

    var r = x.replace(tainted, 'there');

    // @witness always r[r.length-1]='e' clean suffix from literal replacement
    __assert_taint__(r[r.length-1], false);
}

__test_taint__(__set_taint__('world'));

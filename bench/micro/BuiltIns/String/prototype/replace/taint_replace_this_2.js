// @type taint
// @target es5 String.prototype.replace
// @feature builtin replace
// @done

function __test_taint__(tainted) {
    var x = tainted + 'oobar';
    var r = x.replace('bar', 'XYZ');

    // @witness always r[r.length-1]='Z'
    __assert_taint__(r[r.length - 1], false);
}

__test_taint__(__set_taint__('f'));

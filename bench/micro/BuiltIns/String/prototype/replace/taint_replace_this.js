// @type taint
// @target es5 String.prototype.replace
// @feature builtin replace
// @done

function __test_taint__(tainted) {
    var x = tainted + 'oobar';
    var r = x.replace('bar', 'XYZ');

    // @witness __test_taint__('x') => r[0]='x'
    __assert_taint__(r[0], true);

    // @witness always r[r.length-1]='Z'
    __assert_taint__(r[r.length - 1], false);

    // replacement longer than match: the tainted tail shifts right
    var ry = ("a'" + tainted).replace("'", "''");
    // @witness always ry[1]="'"
    __assert_taint__(ry[1], false);
    // @witness __test_taint__('x') => ry[3]='x'
    __assert_taint__(ry[3], true);

}

__test_taint__(__set_taint__('f'));

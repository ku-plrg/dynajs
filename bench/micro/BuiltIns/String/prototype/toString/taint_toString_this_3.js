// @type taint
// @target es5 String.prototype.toString
// @feature builtin toString
// @done

function __test_taint__(tainted) {
    var x0 = 'f';
    var x2 = 'o';
    var x = x0 + tainted + x2;
    var r = x.toString();

    // @witness always r[r.length-1]='o' (clean suffix)
    __assert_taint__(r[r.length-1], false);
}

__test_taint__(__set_taint__('hello'));

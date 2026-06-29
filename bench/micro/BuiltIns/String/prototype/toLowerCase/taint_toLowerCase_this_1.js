// @type taint
// @target es5 String.prototype.toLowerCase
// @feature builtin toLowerCase
// @done

function __test_taint__(tainted) {
    var x0 = 'A';
    var x2 = 'C';
    var x = x0 + tainted + x2;
    var r = x.toLowerCase();

    // @witness always r[0]='a'
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__('hello'));

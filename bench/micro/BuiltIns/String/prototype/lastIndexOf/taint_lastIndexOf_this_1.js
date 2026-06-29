// @type taint
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// @done

function __test_taint__(tainted) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + tainted + x2;

    // @witness lastIndexOf returns a position number, not content
    __assert_taint__(x.lastIndexOf('h'), false);
}

__test_taint__(__set_taint__('hello'));

// @type taint
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// done

function test(x1) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + x1 + x2;

    // @witness lastIndexOf returns a position number, not content
    __assert_taint__(x.lastIndexOf('h'), false);

    // @witness lastIndexOf returns a position number, not content
    __assert_taint__(x.lastIndexOf('i'), false);

    // @witness not-found returns -1, a sentinel number
    __assert_taint__(x.lastIndexOf('z'), false);
}

var x1 = 'hello';
__set_taint__(x1);
test(x1);

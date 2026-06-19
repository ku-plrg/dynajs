// @type taint
// @target es6+ String.prototype.includes
// @feature builtin includes
// done

function test(x1) {
    var x0 = 'f';
    var x2 = 'o';
    var x = x0 + x1 + x2;

    // @witness includes returns a boolean
    __assert_taint__(x.includes('foo'), false);

    // @witness includes returns a boolean
    __assert_taint__(x.includes('o'), false);

    // @witness includes returns a boolean
    __assert_taint__(x.includes('z'), false);
}

var x1 = 'o';
__set_taint__(x1);
test(x1);

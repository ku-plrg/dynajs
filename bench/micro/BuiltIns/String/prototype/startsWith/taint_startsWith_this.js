// @type taint
// @target es6+ String.prototype.startsWith
// @feature builtin startsWith
// done

function test(x1) {
    var x0 = 'f';
    var x2 = 'o';
    var x = x0 + x1 + x2;

    // @witness startsWith returns a boolean
    __assert_taint__(x.startsWith('foo'), false);

    // @witness startsWith returns a boolean
    __assert_taint__(x.startsWith('fo'), false);

    // @witness startsWith returns a boolean
    __assert_taint__(x.startsWith('z'), false);
}

var x1 = 'o';
__set_taint__(x1);
test(x1);

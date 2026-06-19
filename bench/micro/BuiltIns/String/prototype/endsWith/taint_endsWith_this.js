// @type taint
// @target es6+ String.prototype.endsWith
// @feature builtin endsWith
// done

function test(x1) {
    var x0 = 'fo';
    var x = x0 + x1;

    // @witness endsWith returns a boolean
    __assert_taint__(x.endsWith('o'), false);

    // @witness endsWith returns a boolean
    __assert_taint__(x.endsWith('z'), false);
}

var x1 = 'o';
__set_taint__(x1);
test(x1);

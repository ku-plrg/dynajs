// @type taint
// @target es5 String.prototype.substr
// @feature builtin substr

function test(n) {
    var x = 'hello';

    // @witness 'hello' clean; tainted n is only the length bound
    __assert_taint__(x.substr(1, n), false);
}

var n = 3;
__set_taint__(n);
test(n);

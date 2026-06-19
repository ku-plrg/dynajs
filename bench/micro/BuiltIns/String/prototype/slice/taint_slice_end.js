// @type taint
// @target es5 String.prototype.slice
// @feature builtin slice

function test(e) {
    var x = 'hello';

    // @witness 'hello' clean; tainted e is only the end bound
    __assert_taint__(x.slice(1, e), false);
}

var e = 4;
__set_taint__(e);
test(e);

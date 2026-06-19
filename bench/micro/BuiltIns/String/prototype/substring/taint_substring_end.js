// @type taint
// @target es5 String.prototype.substring
// @feature builtin substring

function test(e) {
    var x = 'hello';

    // @witness 'hello' clean; tainted e is only the end bound
    __assert_taint__(x.substring(1, e), false);
}

var e = 4;
__set_taint__(e);
test(e);

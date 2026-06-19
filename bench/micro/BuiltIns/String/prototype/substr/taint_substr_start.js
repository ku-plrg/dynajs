// @type taint
// @target es5 String.prototype.substr
// @feature builtin substr

function test(s) {
    var x = 'hello';

    // @witness 'hello' clean; tainted s is only the start bound
    __assert_taint__(x.substr(s, 3), false);
}

var s = 1;
__set_taint__(s);
test(s);

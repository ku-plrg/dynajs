// @type taint
// @target es5 String.prototype.slice
// @feature builtin slice

function test(s) {
    var x = 'hello';

    // @witness 'hello' clean; tainted s is only the start bound
    __assert_taint__(x.slice(s, 4), false);
}

var s = 1;
__set_taint__(s);
test(s);

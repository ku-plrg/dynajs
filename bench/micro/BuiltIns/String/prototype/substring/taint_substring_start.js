// @type taint
// @target es5 String.prototype.substring
// @feature builtin substring

function test(s) {
    var x = 'hello';

    // @witness 'hello' clean; tainted s is only the start bound
    __assert_taint__(x.substring(s, 4), false);
}

var s = 1;
__set_taint__(s);
test(s);

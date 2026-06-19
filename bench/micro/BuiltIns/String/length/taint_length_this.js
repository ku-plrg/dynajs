// @type taint
// @target es5 String length
// @feature builtin length

function test(x1) {
    var x = 'h' + x1 + 'i';

    // @witness x.length is a count (metadata), not content
    __assert_taint__(x.length, false);
}

var x1 = 'x';
__set_taint__(x1);
test(x1);

// @type taint
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// done

function test(p) {
    var x = 'barbarfoo';

    // @witness tainted p is only the fromIndex; lastIndexOf returns a position number
    __assert_taint__(x.lastIndexOf('bar', p), false);
}

var p = 3;
__set_taint__(p);
test(p);

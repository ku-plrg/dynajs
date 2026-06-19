// @type taint
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// done

function test(s) {
    var x = 'foobar';

    // @witness tainted s is only the search key; lastIndexOf returns a position number
    __assert_taint__(x.lastIndexOf(s), false);
}

var s = 'bar';
__set_taint__(s);
test(s);

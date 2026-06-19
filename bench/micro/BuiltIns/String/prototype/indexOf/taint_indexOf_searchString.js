// @type taint
// @target es5 String.prototype.indexOf
// @feature builtin indexOf
// done

function test(s) {
    var x = 'foobar';

    // @witness tainted s is only the search key; indexOf returns a position number
    __assert_taint__(x.indexOf(s), false);
}

var s = 'bar';
__set_taint__(s);
test(s);

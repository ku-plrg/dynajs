// @type taint
// @target es5 String.prototype.indexOf
// @feature builtin indexOf
// done

function test(p) {
    var x = 'foobarbar';

    // @witness tainted p is only the fromIndex; indexOf returns a position number
    __assert_taint__(x.indexOf('bar', p), false);
}

var p = 4;
__set_taint__(p);
test(p);

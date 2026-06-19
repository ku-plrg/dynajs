// @type taint
// @target es6+ String.prototype.startsWith
// @feature builtin startsWith
// done

function test(p) {
    var x = 'foobar';

    // @witness tainted p is only the position index; startsWith returns a boolean
    __assert_taint__(x.startsWith('bar', p), false);
}

var p = 3;
__set_taint__(p);
test(p);

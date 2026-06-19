// @type taint
// @target es6+ String.prototype.includes
// @feature builtin includes
// done

function test(p) {
    var x = 'foobar';

    // @witness tainted p is only the position index; includes returns a boolean
    __assert_taint__(x.includes('bar', p), false);
}

var p = 3;
__set_taint__(p);
test(p);

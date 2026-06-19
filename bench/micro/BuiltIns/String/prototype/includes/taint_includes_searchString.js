// @type taint
// @target es6+ String.prototype.includes
// @feature builtin includes
// done

function test(s) {
    var x = 'foobar';

    // @witness tainted s is only the search key; includes returns a boolean
    __assert_taint__(x.includes(s), false);
}

var s = 'bar';
__set_taint__(s);
test(s);

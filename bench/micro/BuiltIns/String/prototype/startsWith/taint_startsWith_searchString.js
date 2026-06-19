// @type taint
// @target es6+ String.prototype.startsWith
// @feature builtin startsWith
// done

function test(s) {
    var x = 'foobar';

    // @witness tainted s is only the search key; startsWith returns a boolean
    __assert_taint__(x.startsWith(s), false);
}

var s = 'foo';
__set_taint__(s);
test(s);

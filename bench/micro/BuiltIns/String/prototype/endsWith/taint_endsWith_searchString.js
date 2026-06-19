// @type taint
// @target es6+ String.prototype.endsWith
// @feature builtin endsWith
// done

function test(s) {
    var x = 'foo';

    // @witness tainted s is only the search key; endsWith returns a boolean
    __assert_taint__(x.endsWith(s), false);
}

var s = 'o';
__set_taint__(s);
test(s);

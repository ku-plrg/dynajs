// @type taint
// @target es6+ String.prototype.endsWith
// @feature builtin endsWith
// done

function test(ep) {
    var x = 'foobar';

    // @witness tainted ep is only the endPosition index; endsWith returns a boolean
    __assert_taint__(x.endsWith('foo', ep), false);
}

var ep = 3;
__set_taint__(ep);
test(ep);

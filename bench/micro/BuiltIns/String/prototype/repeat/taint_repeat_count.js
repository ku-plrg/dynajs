// @type taint
// @target es6+ String.prototype.repeat
// @feature builtin repeat

function test(c) {
    var x = 'ab';

    // @witness 'ab' clean; tainted c is only the count bound
    __assert_taint__(x.repeat(c), false);
}

var c = 3;
__set_taint__(c);
test(c);

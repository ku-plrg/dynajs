// @type taint
// @target es6+ String.prototype.padEnd
// @feature builtin padEnd

function test(m) {
    var x = 'hi';

    // @witness 'hi' clean; tainted m is only the maxLength bound
    __assert_taint__(x.padEnd(m, '.'), false);
}

var m = 5;
__set_taint__(m);
test(m);

// @type taint
// @target es6+ String.prototype.blink
// @feature builtin blink

function test(x1) {
    var x0 = 'a';
    var x = x1 + x0;
    var r = x.blink();

    // @witness always r[0]='<' (tag char, not from receiver)
    __assert_taint__(r[0], false);

    // @witness test('x') => r[7]='x' (tainted receiver char at index 7)
    __assert_taint__(r[7], true);

    // @witness always r[r.length-1]='>' (tag close char, always clean)
    __assert_taint__(r[r.length-1], false);
}

var x1 = 'b';
__set_taint__(x1);
test(x1);

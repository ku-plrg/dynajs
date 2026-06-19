// @type taint
// @target es5 String length
// @feature builtin length

function test(x1) {
    var x = x1;

    // @witness test('x'.repeat(42)) => x.length=42 (attacker-controlled count)
    __assert_taint__(x.length, true);
}

var x1 = 'x'.repeat(42);
__set_taint__(x1);
test(x1);

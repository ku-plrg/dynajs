// @type taint
// @target es6+ String.fromCodePoint
// @feature builtin fromCodePoint

function test(cp) {
    var r = String.fromCodePoint(72, cp);

    // @witness always r[0]='H' (from clean code point 72)
    __assert_taint__(r[0], false);

    // @witness test(120) => r[1]='x' (char content from tainted code point)
    __assert_taint__(r[1], true);
}

var cp = 120;
__set_taint__(cp);
test(cp);

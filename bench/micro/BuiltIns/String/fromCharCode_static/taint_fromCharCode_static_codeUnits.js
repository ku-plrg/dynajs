// @type taint
// @target es5 String.fromCharCode
// @feature builtin fromCharCode

function test(code) {
    var r = String.fromCharCode(72, code);

    // @witness always r[0]='H' (from clean code 72)
    __assert_taint__(r[0], false);

    // @witness test(120) => r[1]='x' (char content from tainted code)
    __assert_taint__(r[1], true);
}

var code = 120;
__set_taint__(code);
test(code);

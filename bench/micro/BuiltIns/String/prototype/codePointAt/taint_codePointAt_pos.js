// @type taint
// @target es6+ String.prototype.codePointAt
// @feature builtin codePointAt

function test(pos) {
    var x = 'hello';

    // @witness 'hello' clean; tainted pos is only the index
    __assert_taint__(x.codePointAt(pos), false);
}

var pos0 = 3;
__set_taint__(pos0);
test(pos0);

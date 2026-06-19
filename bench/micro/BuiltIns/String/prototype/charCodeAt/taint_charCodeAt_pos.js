// @type taint
// @target es6+ String.prototype.charCodeAt
// @feature builtin charCodeAt

function test(pos) {
    var x = 'hello';

    // @witness 'hello' clean; tainted pos is only the index
    __assert_taint__(x.charCodeAt(pos), false);
}

var pos0 = 3;
__set_taint__(pos0);
test(pos0);

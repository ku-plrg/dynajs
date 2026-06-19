// @type taint
// @target es6+ String.prototype.at
// @feature builtin at

function test(y) {
    var x = 'hello';

    // @witness 'hello' clean; tainted y is only the index
    __assert_taint__(x.at(y), false);
}

var y0 = 3;
__set_taint__(y0);
test(y0);

// @type taint
// @target es6+ String.prototype.charAt
// @feature builtin charAt
// @done

function test(pos) {
    var x = 'hello';

    // @witness 'hello' clean; tainted pos is only the index
    __assert_taint__(x.charAt(pos), false);
}

var pos0 = 3;
__set_taint__(pos0);
test(pos0);

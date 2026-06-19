// @type taint
// @target es5 String.prototype.search
// @feature builtin search
// done

function test(x1) {
    var x0 = 'hello';
    var x = x0 + x1;

    // @witness search returns a position number, not content
    __assert_taint__(x.search(/[0-9]/), false);

    // @witness not-found returns -1, a sentinel number
    __assert_taint__(x.search(/z/), false);
}

var x1 = '1';
__set_taint__(x1);
test(x1);

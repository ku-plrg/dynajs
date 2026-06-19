// @type taint
// @target es6+ String.prototype.at
// @feature builtin at
// done

function test(x1) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + x1 + x2;

    // @witness always x.at(0)='h'
    __assert_taint__(x.at(0), false);

    // @witness test('x') => x.at(1)='x'
    __assert_taint__(x.at(1), true);

    // @witness test('ax') => x.at(2)='x'
    __assert_taint__(x.at(2), true);

    // @witness always x.at(x.length)=undefined
    __assert_taint__(x.at(x.length), false);
}

var x = 'hello';
__set_taint__(x);

test(x);

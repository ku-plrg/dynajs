// @type taint
// @target es6+ String.prototype.padEnd
// @feature builtin padEnd

function test(f) {
    var x = 'hi';

    // @witness always x.padEnd(4,f)[0]='h' (clean receiver)
    __assert_taint__(x.padEnd(4, f)[0], false);

    // @witness always x.padEnd(4,f)[1]='i' (clean receiver)
    __assert_taint__(x.padEnd(4, f)[1], false);

    // @witness test('x') => x.padEnd(4,f)[2]='x' (tainted fill)
    __assert_taint__(x.padEnd(4, f)[2], true);

    // @witness test('x') => x.padEnd(4,f)[3]='x' (tainted fill)
    __assert_taint__(x.padEnd(4, f)[3], true);

    // @witness always x.padEnd(2,f)[0]='h' (no pad; clean receiver)
    __assert_taint__(x.padEnd(2, f)[0], false);

    // @witness always x.padEnd(2,f)[1]='i' (no pad; clean receiver)
    __assert_taint__(x.padEnd(2, f)[1], false);
}

var f = '*';
__set_taint__(f);
test(f);

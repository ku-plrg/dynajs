// @type taint
// @target es6+ String.prototype.padStart
// @feature builtin padStart

function test(f) {
    var x = 'hi';

    // @witness test('x') => x.padStart(4,f)[0]='x' (tainted fill)
    __assert_taint__(x.padStart(4, f)[0], true);

    // @witness test('x') => x.padStart(4,f)[1]='x' (tainted fill)
    __assert_taint__(x.padStart(4, f)[1], true);

    // @witness always x.padStart(4,f)[2]='h' (clean receiver)
    __assert_taint__(x.padStart(4, f)[2], false);

    // @witness always x.padStart(4,f)[3]='i' (clean receiver)
    __assert_taint__(x.padStart(4, f)[3], false);

    // @witness always x.padStart(2,f)[0]='h' (no pad; clean receiver)
    __assert_taint__(x.padStart(2, f)[0], false);

    // @witness always x.padStart(2,f)[1]='i' (no pad; clean receiver)
    __assert_taint__(x.padStart(2, f)[1], false);
}

var f = '*';
__set_taint__(f);
test(f);

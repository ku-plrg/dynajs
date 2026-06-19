// @type taint
// @target es6+ String.prototype.replaceAll
// @feature builtin replaceAll
// done

function test(v) {
    var x = 'a.b.c';

    var r = x.replaceAll('.', v);

    // @witness always r[0]='a' from clean receiver
    __assert_taint__(r[0], false);

    // @witness test('x') => r[1]='x' from tainted v
    __assert_taint__(r[1], true);

    // @witness always r[r.length-1]='c' clean suffix from receiver
    __assert_taint__(r[r.length-1], false);
}

var v = 'Z';
__set_taint__(v);

test(v);

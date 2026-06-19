// @type taint
// @target es5 String.prototype.replace
// @feature builtin replace
// done

function test(v) {
    var x = 'abc';

    var r = x.replace('b', v);

    // @witness always r[0]='a' from clean receiver
    __assert_taint__(r[0], false);

    // @witness test('xx') => r[1]='x' from tainted v
    __assert_taint__(r[1], true);

    // @witness test('xx') => r[2]='x' from tainted v
    __assert_taint__(r[2], true);

    // @witness always r[r.length-1]='c' clean suffix from receiver
    __assert_taint__(r[r.length-1], false);
}

var v = 'YZ';
__set_taint__(v);

test(v);

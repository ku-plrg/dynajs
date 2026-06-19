// @type taint
// @target es5 String.prototype.replace
// @feature builtin replace
// done

function test(x1) {
    var x = x1 + 'oobar';

    var r = x.replace('bar', 'XYZ');

    // @witness test('x') => r[0]='x' from tainted x1
    __assert_taint__(r[0], true);

    // @witness always r[r.length-1]='Z' clean suffix from literal replacement
    __assert_taint__(r[r.length-1], false);
}

var x1 = 'f';
__set_taint__(x1);

test(x1);

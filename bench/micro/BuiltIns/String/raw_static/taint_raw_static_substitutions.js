// @type taint
// @target es6+ String.raw
// @feature builtin raw-static
// done

function test(s) {
    var r = String.raw`ab${s}cd`;

    // @witness always r[0]='a' from literal template
    __assert_taint__(r[0], false);

    // @witness always r[1]='b' from literal template
    __assert_taint__(r[1], false);

    // @witness test('x') => r[2]='x' from tainted substitution s
    __assert_taint__(r[2], true);

    // @witness always r[r.length-1]='d' clean suffix from literal template
    __assert_taint__(r[r.length-1], false);
}

var s = 'X';
__set_taint__(s);

test(s);

// @type taint
// @target es6+ String.prototype.charCodeAt
// @feature builtin charCodeAt
// @done

function __test_taint__(tainted) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + tainted + x2;

    // @witness always x.charCodeAt(0)=104 ('h', clean prefix)
    __assert_taint__(x.charCodeAt(0), false);

    // @witness __test_taint__('x') => x.charCodeAt(1)=120 ('x', first tainted char)
    __assert_taint__(x.charCodeAt(1), true);

    // @witness always x.charCodeAt(x.length-1)=105 ('i', clean suffix)
    __assert_taint__(x.charCodeAt(x.length - 1), false);

    // @witness always x.charCodeAt(x.length)=NaN (just past end)
    __assert_taint__(x.charCodeAt(x.length), false);
}

__test_taint__(__set_taint__('hello'));

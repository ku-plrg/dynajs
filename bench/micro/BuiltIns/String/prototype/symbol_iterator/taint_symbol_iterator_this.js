// @type taint
// @target es6+ String.prototype[Symbol.iterator]
// @feature builtin symbol-iterator
// @done

function __test_taint__(tainted) {
    var x = 'h' + tainted + 'i';
    var chars = [...x];

    // @witness always chars[0]='h' (clean prefix)
    __assert_taint__(chars[0], false);

    // @witness __test_taint__('x') => chars[1]='x' (tainted char)
    __assert_taint__(chars[1], true);

    // @witness always chars[chars.length-1]='i' (clean suffix)
    __assert_taint__(chars[chars.length - 1], false);
}

__test_taint__(__set_taint__('hello'));

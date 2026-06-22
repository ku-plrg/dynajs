// @type taint
// @target es6+ String.prototype.at
// @feature builtin at
// @done

function __test_taint__(tainted) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + tainted + x2;

    // @witness always x.at(0)='h'
    __assert_taint__(x.at(0), false);

    // @witness __test_taint__('x') => x.at(1)='x'
    __assert_taint__(x.at(1), true);

    // @witness __test_taint__('xx') => x.at(2)='x'
    __assert_taint__(x.at(2), true);

    // @witness always x.at(x.length)=undefined
    __assert_taint__(x.at(x.length), false);

    // @witness __test_taint__('xx') => x.at(-2)='x'
    __assert_taint__(x.at(-2), true);

    // @witness always x.at(-1)='i'
    __assert_taint__(x.at(-1), false);
}

__test_taint__(__set_taint__('hello'));

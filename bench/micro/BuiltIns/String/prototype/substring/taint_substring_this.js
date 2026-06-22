// @type taint
// @target es5 String.prototype.substring
// @feature builtin substring
// @done

function __test_taint__(tainted) {
    var x0 = 'f';
    var x2 = 'o';
    var x3 = 'b';
    var x4 = 'a';
    var x = x0 + tainted + x2 + x3 + x4;

    // @witness __test_taint__('x') => x.substring(1,4)[0]='x' (tainted char at index 1)
    __assert_taint__(x.substring(1, 4)[0], true);

    // @witness always x.substring(1,x.length)[x.length-2]='a' (clean literal)
    __assert_taint__(x.substring(1, x.length)[x.length - 2], false);

    // @witness always x.substring(2,2)=''
    __assert_taint__(x.substring(2, 2), false);

    // substring swaps args when start > end: (4,1) -> (1,4) = "qob"
    // @witness __test_taint__('x') => x.substring(4,1)[0]='x'
    __assert_taint__(x.substring(4, 1)[0], true);

    // substring clamps a negative index to 0: (-2,2) -> (0,2) = "fq"
    // @witness __test_taint__('x') => x.substring(-2,2)[1]='x'
    __assert_taint__(x.substring(-2, 2)[1], true);
}

__test_taint__(__set_taint__('q'));

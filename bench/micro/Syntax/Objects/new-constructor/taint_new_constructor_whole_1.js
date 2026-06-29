// @type taint
// @target es5 Object
// @feature syntax object-taint
// @done

function __test_taint__(tainted) {
    // the whole object is the taint source (its property present at taint time)
    // @witness __test_taint__({p1: 42}) => tainted = {p1:42} tainted
    __assert_taint__(tainted, true);
}

__test_taint__(__set_taint__({a: 1}));

// @type taint
// @target es5 object-literal
// @feature syntax object-prop-taint

function __test_taint__(tainted) {
    // tainted = {test:"Hello"}; the whole object is the source
    // @witness __test_taint__({test: "Hello"}) => tainted = {test:"Hello"} tainted
    __assert_taint__(tainted, true);
    // @witness __test_taint__({test: "Hello"}) => tainted.test = "Hello" tainted
    __assert_taint__(tainted.test, true);
}

__test_taint__(__set_taint__({test: "Hello"}));

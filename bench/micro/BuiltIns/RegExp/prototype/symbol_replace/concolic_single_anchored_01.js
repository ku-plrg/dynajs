// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-single-anchored

function __test_symbolic__(symbolic) {
    symbolic = symbolic.replace(/^(a|b)$/, "hello");
    // @witness __test_symbolic__("a")
    __IS_SAT__(symbolic === "hello", true);
}

__test_symbolic__(__symbolic__('s', "A"));

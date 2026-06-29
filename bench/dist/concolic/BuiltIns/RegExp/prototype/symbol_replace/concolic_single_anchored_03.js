// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-single-anchored

function __test_symbolic__(symbolic) {
    symbolic = symbolic.replace(/^(a|b)$/, "hello");

    // @witness only input "b" could leave result "b", but "b" matches /^(a|b)$/ and is rewritten to "hello"
    __IS_SAT__(symbolic === "b", false);
}

__test_symbolic__(__symbolic__('s', "b"));

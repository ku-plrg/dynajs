// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-single-anchored

function __test_symbolic__(symbolic) {
    symbolic = symbolic.replace(/^(a|b)$/, "hello");

    // @witness only input "a" could leave result "a", but "a" matches /^(a|b)$/ and is rewritten to "hello"
    __IS_SAT__(symbolic === "a", false);
}

__test_symbolic__(__symbolic__('s', "a"));

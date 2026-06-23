// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-alternation

function __test_symbolic__(symbolic) {
  if (/^(a|b|c)(c|d)([a-z]|[0-9])$/.test(symbolic)) {
    // @witness the guard forces exactly 3 chars (c1 c2 c3), so a 2-char match is impossible
    __IS_SAT__(/^..$/.test(symbolic), false);
    // @witness __test_symbolic__("ac3")
    __IS_SAT__(symbolic === "ac3", true);
    // @witness __test_symbolic__("ccp")
    __IS_SAT__(symbolic === "ccp", true);
    // @witness "ac4p" is 4 chars and cannot match the 3-group guard, so it never reaches this branch
    __IS_SAT__(symbolic === "ac4p", false);
  } else {
    // @witness "ac5" matches the guard and takes the then-branch, so in the else branch it is unreachable
    __IS_SAT__(symbolic === "ac5", false);
  }
}

__test_symbolic__(__symbolic__('s', ""));

// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-escape

function __test_symbolic__(symbolic) {
  if (/^Hello(world)how are you\(today\)huh\?huh?$/.test(symbolic)) {
    // @witness anchored ^...$ with only a trailing h? optional pins the whole string to exactly one of the two literals, so neither can be excluded
    __IS_SAT__(!(symbolic === "Helloworldhow are you(today)huh?hu" || symbolic === "Helloworldhow are you(today)huh?huh"), false);
  }
}

__test_symbolic__(__symbolic__("s", "Helloworldhow are you(today)huh?hu"));

// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-callback-capture

function __test_symbolic__(symbolic) {
  symbolic.replace(/^.+(.).+/, function (zero, one) {
    // @witness capture (.) binds exactly one char, so it can never equal the 3-char "dog"
    __IS_SAT__(one === "dog", false);
  });
}

__test_symbolic__(__symbolic__("s", "dog"));

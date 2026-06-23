// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^h+?$/.test(symbolic)) {
    // @witness under /^h+?$/ the whole string is only "h" chars, so it can never be entirely non-"h"
    __IS_SAT__(/^[^h]+$/.test(symbolic), false);
  }
  if (/^z+?$/.test(symbolic)) {
    if (symbolic.length < 5) {
      for (var i = 0; i < symbolic.length; i++) {
      }
    }
  }
}

__test_symbolic__(__symbolic__("s", "h"));
